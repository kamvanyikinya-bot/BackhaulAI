import json
from uuid import uuid4
import os
import sqlite3

# This script assumes it runs where it can access team-db or directly the db file if known.
# Since I should use team-db CLI, I'll generate the SQL statements.

def generate_import_sql(json_path, lead_type):
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    leads = data.get('leads', [])
    statements = []
    
    for lead in leads:
        id = str(uuid4())
        name = lead.get('name', '').replace("'", "''")
        city = lead.get('city', '').replace("'", "''")
        company = lead.get('company', '').replace("'", "''") if 'company' in lead else ''
        notes = f"Typical routes: {', '.join(lead.get('typical_routes', []))}. Annual waste: R{lead.get('estimated_annual_waste_zar', 0):,}"
        notes = notes.replace("'", "''")
        
        sql = f"INSERT INTO leads (id, name, city, company, type, source, notes) VALUES ('{id}', '{name}', '{city}', '{company}', '{lead_type}', 'expanded_list', '{notes}');"
        statements.append(sql)
    
    return statements

if __name__ == "__main__":
    # Import expanded B2C leads
    statements = generate_import_sql('/home/team/shared/leads/b2c-leads-expanded.json', 'driver')
    
    # Import existing B2B leads if they exist
    if os.path.exists('/home/team/shared/leads/b2b-leads.json'):
        statements += generate_import_sql('/home/team/shared/leads/b2b-leads.json', 'shipper')
        
    # Import existing B2C leads
    if os.path.exists('/home/team/shared/leads/b2c-leads.json'):
        statements += generate_import_sql('/home/team/shared/leads/b2c-leads.json', 'driver')

    with open('/home/team/shared/scripts/import_leads.sql', 'w') as f:
        for s in statements:
            f.write(s + "\n")
    
    print(f"Generated {len(statements)} insert statements.")
