const WIDTH = 640;
const HEIGHT = 320;
const MARGIN = 100;
// Get the argument value from localStorage
let StackToColor = JSON.parse(localStorage.getItem("StackToColor"))
let selected = JSON.parse(localStorage.getItem("selected"))
if (StackToColor === null)
    StackToColor = Array()
if (selected === null)
    selected = ""

console.log(StackToColor)

// Array of values calculated by the function below
const X = d3.map(nodes, n => n[0]);
const Y = d3.map(nodes, n => n[1]);

// Диапазон значений из массивов выше
const xDomain = [d3.min(X), d3.max(X)];
const yDomain = [d3.min(Y), d3.max(Y)];

// Диапазон координат, в которых будет построен график
const xRange = [0, WIDTH];
const yRange = [HEIGHT, 0];

// Scale (масштаб) - определяется исходя из двух диапазонов
const scaleX = d3.scaleLinear(xDomain, xRange);
const scaleY = d3.scaleLinear(yDomain, yRange);

// Use the scales to draw the circles
const canvas = d3.select('#canvas')
    .attr("width", WIDTH + MARGIN * 2)
    .attr("height", HEIGHT + MARGIN * 2);

const nodesGroup = canvas.append('g')
    .attr('transform', `translate(${MARGIN}, ${MARGIN})`);

// Draw nodes
nodesGroup.selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr("fill", "red")
    .attr("cx", n => scaleX(n[0]))
    .attr("cy", n => scaleY(n[1]))
    .attr("r", 2);

const elementsGroup = canvas.append('g')
    .attr('transform', `translate(${MARGIN}, ${MARGIN})`);

// Draw strokes and triangles
const trianglePaths = elementsGroup.selectAll('path')
    .data(elements)
    .enter()
    .append('path')
    .attr('fill', d => checkNeeded(d)
        ?
        (makeTriangle(d) == selected
            ? getRandomColor()
            : "blue"
        )
        : "white")
    .attr('stroke', 'black')
    .attr('d', elem => makeTriangle(elem))
    .on('click', function (d, elem) {
        const path = d3.select(this);
        const item = path.attr("d")
        if (path.attr("fill") == "white") {
            selected = item
            StackToColor.push(item)
        } else {
            // remove item
            var index = StackToColor.indexOf(item);
            selected = ""
            if (index !== -1)
                StackToColor.splice(index, 1);
        }
        // Set the argument value in localStorage
        localStorage.setItem('StackToColor', JSON.stringify(StackToColor));
        localStorage.setItem('selected', JSON.stringify(selected));
        location.reload();
    });

function makeTriangle(elem) {
    const n1 = nodes[elem[0] - 1];
    const n2 = nodes[elem[1] - 1];
    const n3 = nodes[elem[2] - 1];
    const scaled = (elem) => [scaleX(elem[0]), scaleY(elem[1])]
    const pathData = d3.line()([
        scaled(n1),
        scaled(n2),
        scaled(n3),
    ]);
    return pathData + 'Z';
}
// get random color in rgb
function getRandomColor() {
    return `rgb(
        ${Math.floor(Math.random() * 255)}, 
        ${Math.floor(Math.random() * 255)}, 
        ${Math.floor(Math.random() * 255)}
    `
}
function checkNeeded(elem) {
    for (let index = 0; index < StackToColor.length; index++)
        if (makeTriangle(elem) == StackToColor[index])
            return true;
    return false;
}
function pointInTriangle(point, triangle) {
    const [x, y] = point;
    const [v1, v2, v3] = triangle;

    // Calculate the denominator of the barycentric coordinates equation
    const denominator = ((v2[1] - v3[1]) * (v1[0] - v3[0])) + ((v3[0] - v2[0]) * (v1[1] - v3[1]));

    // Calculate the barycentric coordinates of the point with respect to the triangle
    const a = ((v2[1] - v3[1]) * (x - v3[0])) + ((v3[0] - v2[0]) * (y - v3[1])) / denominator;
    const b = ((v3[1] - v1[1]) * (x - v3[0])) + ((v1[0] - v3[0]) * (y - v3[1])) / denominator;
    const c = 1 - a - b;
    console.log(a, b, c)

    // Check if the point is inside the triangle
    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}
