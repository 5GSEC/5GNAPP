from http.server import BaseHTTPRequestHandler, HTTPServer
import sqlite3
import json

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/fetchUserData':
            self._set_headers()
            data = self.fetch_user_data()
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def fetch_user_data(self):
        bs_db = sqlite3.connect('db/main.db')
        cursor = bs_db.cursor()
        cursor.execute("SELECT nr_cell_id as id, report_period FROM bs")
        bs_rows = cursor.fetchall()
        data = {}
        for bs in bs_rows:
            cursor.execute(f"select rnti, max(timestamp) from ue where nr_cell_id={bs[0]} group by rnti")
            ue_data = {}
            for ue in cursor.fetchall():
                ue_data[f"{bs[0]}-{ue[0]}"] = {"level": "normal", "timestamp": ue[1], "Event Name": "None"}
            # get the event data
            cursor.execute("select * from event")
            
            for ev in cursor.fetchall():
                if f"{ev[2]}-{ev[4]}" in ue_data:
                    ue_data[f"{ev[2]}-{ev[4]}"] = {"level": ev[5], "timestamp": ev[3], "Event Name": ev[1]}
            
            data[bs[0]] = {
                "report-period": bs[1],
                "stations": ue_data
            }

        bs_db.close()
        return data

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}')
    httpd.serve_forever()

if __name__ == "__main__":
    run()