from flask import *
import mysql.connector
from dbContextManager import *

app = Flask(__name__)

# load config data
with open("config/dbconfig.json", 'r') as f:
    config = json.load(f)

app.config['db_config'] = config

nodes_data = elements_data = None


def loadData():
    global nodes_data, elements_data
    with DBContextManager(app.config['db_config']) as cursor:
        if cursor is None:
            raise ValueError('Cursor not found')
        # get nodes
        cursor.execute("SELECT x,y FROM nodes")
        nodes_data = cursor.fetchall()
        # get elements
        cursor.execute("SELECT n1,n2,n3 FROM elements")
        elements_data = cursor.fetchall()


@app.route("/")
def index():
    loadData()
    return render_template("index.html", nodes=nodes_data, elements=elements_data)


if __name__ == "__main__":
    loadData()
    app.run("127.0.0.1", port=65534)
