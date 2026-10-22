import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_callout(doc, text, title="KEY POINT FOR REVIEW"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border only (accent border)
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="1E40AF"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(f"📌 {title}: ")
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(10.5)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(30, 64, 175)
    
    run_b = p.add_run(text)
    run_b.font.name = "Calibri"
    run_b.font.size = Pt(10.5)
    run_b.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def create_code_block(doc, code_str):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="6" w:color="CBD5E1"/><w:left w:val="single" w:sz="18" w:color="64748B"/><w:bottom w:val="single" w:sz="6" w:color="CBD5E1"/><w:right w:val="single" w:sz="6" w:color="CBD5E1"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(code_str)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(15, 23, 42)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_document():
    doc = docx.Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    # Styles
    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("Wholesale Order Application")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue
    
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(18)
    run_sub = sub_p.add_run("Backend Database Architecture & Project Review Guide")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(16)
    run_sub.font.color.rgb = RGBColor(71, 85, 105) # Slate
    
    # Metadata Box
    meta_tbl = doc.add_table(rows=2, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False
    meta_tbl.columns[0].width = Inches(3.25)
    meta_tbl.columns[1].width = Inches(3.25)
    
    meta_data = [
        [("Backend Framework:", " Spring Boot (v4.1.1 / Java 17/22)"), ("Database:", " PostgreSQL 18 (orderdb)")],
        [("ORM & Data Access:", " Spring Data JPA + Hibernate"), ("Connection Pool:", " HikariCP (Port 5432)")]
    ]
    
    for r_idx, row in enumerate(meta_data):
        for c_idx, (k, v) in enumerate(row):
            cell = meta_tbl.cell(r_idx, c_idx)
            set_cell_background(cell, "F1F5F9")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r_k = p.add_run(k)
            r_k.font.bold = True
            r_k.font.size = Pt(9.5)
            r_k.font.name = "Calibri"
            r_v = p.add_run(v)
            r_v.font.size = Pt(9.5)
            r_v.font.name = "Calibri"
            
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # ----------------------------------------------------
    # SECTION 1
    # ----------------------------------------------------
    h1 = doc.add_heading("1. Executive Summary & 1-Minute Pitch", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    p = doc.add_paragraph(
        "Use this concise summary if an examiner or reviewer asks: 'Briefly explain your backend and database architecture':"
    )
    p.paragraph_format.space_after = Pt(6)
    
    pitch_text = (
        "\"Our application follows a standard enterprise multi-tier architecture. The React frontend sends HTTP REST "
        "requests formatted in JSON to our Spring Boot backend. Business logic is organized across Controllers, Services, "
        "and Spring Data JPA Repositories. We use Hibernate as our Object-Relational Mapper (ORM) to automatically translate "
        "Java entity objects into SQL operations. Database connectivity is managed by HikariCP, a high-performance connection pool "
        "interfacing with our permanent PostgreSQL relational database ('orderdb' running on port 5432). Furthermore, our "
        "Product entity implements automated reverse-tax GST calculations using JPA lifecycle callbacks prior to database persistence.\""
    )
    create_callout(doc, pitch_text, "1-MINUTE ELEVATOR PITCH FOR REVIEW")
    
    # ----------------------------------------------------
    # SECTION 2
    # ----------------------------------------------------
    h1 = doc.add_heading("2. Complete Architecture & Data Flow", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    doc.add_paragraph("The diagram below illustrates how a client request traverses each architectural layer to reach PostgreSQL:")
    
    diagram = (
        "+-----------------------------------------------------------------------------------+\n"
        "|  1. PRESENTATION LAYER: React Frontend (Vite / Axios / Fetch)                     |\n"
        "|     - User interacts with Login, Admin, or Employee Dashboard                     |\n"
        "|     - Dispatches HTTP Requests: GET, POST, PUT, DELETE with JSON payload          |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | REST API (Port 8080)\n"
        "                                          v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  2. CONTROLLER LAYER: Spring Boot REST Controllers                                |\n"
        "|     - ShopController, CityController, ProductController, UserController           |\n"
        "|     - Validates input, handles routing, and returns ResponseEntity<?>             |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | Java Method Calls\n"
        "                                          v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  3. PERSISTENCE LAYER: Spring Data JPA Repositories                               |\n"
        "|     - Extends JpaRepository<Entity, Long> (CRUD, pagination, dynamic queries)     |\n"
        "|     - Eliminates boilerplate JDBC code and manual PreparedStatement wiring        |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | Object-Relational Mapping (ORM)\n"
        "                                          v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  4. ORM & LIFECYCLE ENGINE: Hibernate ORM                                         |\n"
        "|     - Maps @Entity classes (User, Product, Shop, City) to SQL relational tables   |\n"
        "|     - Triggers @PrePersist and @PreUpdate entity lifecycle hooks                  |\n"
        "|     - Generates dialect-optimized SQL queries for PostgreSQL                      |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | SQL Statements\n"
        "                                          v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  5. CONNECTION POOLING & DRIVER: HikariCP + PostgreSQL JDBC Driver                |\n"
        "|     - Maintains a pre-allocated pool of persistent TCP connections                |\n"
        "|     - Eliminates handshake latency and handles concurrency efficiently            |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | TCP Connection (Port 5432)\n"
        "                                          v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  6. DATABASE STORAGE: PostgreSQL 18 Engine                                        |\n"
        "|     - Database: 'orderdb'                                                         |\n"
        "|     - Tables: 'cities', 'products', 'shops', 'users'                              |\n"
        "|     - ACID Compliant: Guaranteed persistence on disk                              |\n"
        "+-----------------------------------------------------------------------------------+"
    )
    create_code_block(doc, diagram)
    
    # ----------------------------------------------------
    # SECTION 3
    # ----------------------------------------------------
    h1 = doc.add_heading("3. Database Configuration Details (application.properties)", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    doc.add_paragraph("The application's connection parameters are centrally configured in backend/src/main/resources/application.properties:")
    
    config_snippet = (
        "# Server Configuration\n"
        "server.port=8080\n\n"
        "# PostgreSQL Database Connection\n"
        "spring.datasource.url=jdbc:postgresql://localhost:5432/orderdb\n"
        "spring.datasource.username=postgres\n"
        "spring.datasource.password=postgres\n"
        "spring.datasource.driver-class-name=org.postgresql.Driver\n\n"
        "# JPA & Hibernate Settings\n"
        "spring.jpa.hibernate.ddl-auto=update\n"
        "spring.jpa.show-sql=true\n"
        "spring.jpa.properties.hibernate.format_sql=true"
    )
    create_code_block(doc, config_snippet)
    
    # Parameter explanation table
    param_table = doc.add_table(rows=7, cols=2)
    param_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    param_table.columns[0].width = Inches(2.5)
    param_table.columns[1].width = Inches(4.0)
    
    headers = ["Property Key", "Technical Purpose & Impact"]
    for i, h in enumerate(headers):
        cell = param_table.cell(0, i)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(10)
        
    prop_rows = [
        ("spring.datasource.url", "Specifies the JDBC Connection URL: protocol (jdbc), database type (postgresql), host (localhost), port (5432), and database name (orderdb)."),
        ("spring.datasource.username", "The administrative/application user in PostgreSQL (default: postgres)."),
        ("spring.datasource.password", "The password authenticating access to PostgreSQL. Configured as 'postgres'."),
        ("spring.datasource.driver-class-name", "Explicitly loads org.postgresql.Driver from the PostgreSQL runtime JAR in pom.xml to handle low-level byte communication."),
        ("spring.jpa.hibernate.ddl-auto=update", "Schema synchronization strategy: Inspects entity models and automatically creates missing tables and adds new columns without deleting existing data."),
        ("spring.jpa.show-sql & format_sql", "Enables real-time logging of Hibernate-generated SQL queries in the console formatted for easy inspection and debugging.")
    ]
    
    for r_idx, (prop, desc) in enumerate(prop_rows, start=1):
        c0 = param_table.cell(r_idx, 0)
        c1 = param_table.cell(r_idx, 1)
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c1, top=80, bottom=80, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(prop)
        r0.font.name = "Consolas"
        r0.font.size = Pt(9)
        r0.font.bold = True
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(desc)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # ----------------------------------------------------
    # SECTION 4
    # ----------------------------------------------------
    h1 = doc.add_heading("4. Database Entities & Relational Schema", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    doc.add_paragraph("The database schema consists of 4 primary relational tables generated automatically by Hibernate:")
    
    entities = [
        ("1. User Entity (Table: 'users')", "Manages authentication and access control.\n- id (BIGINT, PK, Generated Identity)\n- name (VARCHAR)\n- email (VARCHAR, Unique, Non-null)\n- password (VARCHAR, Non-null)\n- role (VARCHAR: 'admin' or 'employee')"),
        ("2. City Entity (Table: 'cities')", "Stores geographic territories for shop distribution.\n- id (BIGINT, PK, Generated Identity)\n- name (VARCHAR, Non-null)"),
        ("3. Shop Entity (Table: 'shops')", "Represents retail shops managed by wholesale staff.\n- id (BIGINT, PK, Generated Identity)\n- name (VARCHAR, Non-null)\n- address, owner, contact (VARCHAR)\n- city_id (BIGINT, Foreign Key referencing cities.id via @ManyToOne)"),
        ("4. Product Entity (Table: 'products')", "Stores product catalog with financial fields.\n- id (BIGINT, PK, Generated Identity)\n- name (VARCHAR, Non-null), hsn_code (VARCHAR)\n- net_rate (FLOAT, Non-null) & tax_gst (FLOAT, Non-null)\n- Calculated fields: rate, tax_amount, cgst_percent, sgst_percent, cgst_amount, sgst_amount")
    ]
    
    for title, details in entities:
        h2 = doc.add_heading(title, level=2)
        h2.paragraph_format.space_before = Pt(8)
        h2.paragraph_format.space_after = Pt(2)
        h2.runs[0].font.color.rgb = RGBColor(37, 99, 235)
        p = doc.add_paragraph(details)
        p.paragraph_format.space_after = Pt(6)
        
    # Relationship explanation
    create_callout(doc, "In Shop.java, the relationship is mapped as @ManyToOne with @JoinColumn(name = 'city_id', nullable = false). Hibernate automatically generates a FOREIGN KEY constraint referencing the 'cities' table, enforcing relational integrity.", "RELATIONAL INTEGRITY")
    
    # ----------------------------------------------------
    # SECTION 5
    # ----------------------------------------------------
    h1 = doc.add_heading("5. Special Feature: Automated Reverse GST Tax Calculation", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    doc.add_paragraph(
        "A standout architectural feature in the backend is the implementation of JPA Lifecycle Callbacks "
        "(@PrePersist and @PreUpdate) inside Product.java:"
    )
    
    tax_code = (
        "@PrePersist\n"
        "@PreUpdate\n"
        "public void calculateTaxFields() {\n"
        "    if (taxGst == null) taxGst = 0.0;\n"
        "    if (netRate == null) netRate = 0.0;\n\n"
        "    // Reverse Tax formula (Invoice GST standard):\n"
        "    // Base Rate = Net Rate / (1 + GST%)\n"
        "    double divisor = 1.0 + (taxGst / 100.0);\n"
        "    double calculatedRate = divisor > 0 ? (netRate / divisor) : netRate;\n"
        "    this.rate = Math.round(calculatedRate * 100.0) / 100.0;\n\n"
        "    double calculatedTax = netRate - this.rate;\n"
        "    this.taxAmount = Math.round(calculatedTax * 100.0) / 100.0;\n\n"
        "    this.cgstPercent = Math.round((taxGst / 2.0) * 100.0) / 100.0;\n"
        "    this.sgstPercent = Math.round((taxGst / 2.0) * 100.0) / 100.0;\n\n"
        "    double halfTax = this.taxAmount / 2.0;\n"
        "    this.cgstAmount = Math.round(halfTax * 100.0) / 100.0;\n"
        "    this.sgstAmount = Math.round((this.taxAmount - this.cgstAmount) * 100.0) / 100.0;\n"
        "}"
    )
    create_code_block(doc, tax_code)
    
    calc_explanation = (
        "Why this is important to emphasize in reviews:\n"
        "1. Persistence Integrity: Rather than expecting the frontend to accurately calculate taxes, business calculations "
        "are enforced at the entity level right before SQL execution.\n"
        "2. Exact Invoice Matching: It follows the Indian GST Reverse Tax Formula where wholesale prices are entered as "
        "tax-inclusive Net Rates, and the base Rate, CGST, and SGST are mathematically derived and rounded to 2 decimal places."
    )
    p = doc.add_paragraph(calc_explanation)
    p.paragraph_format.space_after = Pt(8)
    
    # ----------------------------------------------------
    # SECTION 6
    # ----------------------------------------------------
    h1 = doc.add_heading("6. PostgreSQL vs. Temporary (H2) Database Comparison", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    doc.add_paragraph("Reviewers frequently ask why a real database is preferred over an in-memory database like H2:")
    
    comp_table = doc.add_table(rows=6, cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_table.columns[0].width = Inches(1.8)
    comp_table.columns[1].width = Inches(2.4)
    comp_table.columns[2].width = Inches(2.4)
    
    comp_headers = ["Feature", "H2 Database (Temporary)", "PostgreSQL 18 (Permanent)"]
    for i, h in enumerate(comp_headers):
        cell = comp_table.cell(0, i)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)
        
    comp_data = [
        ("Storage Medium", "RAM (In-memory volatile memory)", "Persistent Disk Storage (Write-Ahead Logging)"),
        ("Data Lifecycle", "Lost completely when backend stops", "Persists permanently across server restarts"),
        ("Concurrency", "Single process, low throughput", "Multi-process, handles heavy enterprise loads"),
        ("Tooling & Inspection", "Basic web console (/h2-console)", "pgAdmin 4, psql CLI, standard BI tools"),
        ("Production Readiness", "Dev & unit testing only", "Enterprise production standard (ACID compliant)")
    ]
    
    for r_idx, (feat, h2_v, pg_v) in enumerate(comp_data, start=1):
        c0 = comp_table.cell(r_idx, 0)
        c1 = comp_table.cell(r_idx, 1)
        c2 = comp_table.cell(r_idx, 2)
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c in (c0, c1, c2):
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(feat)
        r0.font.bold = True
        r0.font.size = Pt(9)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(h2_v)
        r1.font.size = Pt(9)
        
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(pg_v)
        r2.font.size = Pt(9)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(10)
    
    # ----------------------------------------------------
    # SECTION 7
    # ----------------------------------------------------
    h1 = doc.add_heading("7. High-Probability Review Questions & Model Answers", level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    h1.runs[0].font.color.rgb = RGBColor(30, 58, 138)
    
    qa_list = [
        ("Q1: What is the purpose of Spring Data JPA?",
         "Answer: Spring Data JPA reduces boilerplate data access code. By simply declaring repository interfaces extending JpaRepository<T, ID>, Spring dynamically creates implementation classes with built-in CRUD operations (save, findAll, deleteById) and pagination without requiring manual SQL queries."),
         
        ("Q2: What is the role of HikariCP in this project?",
         "Answer: HikariCP is the default JDBC connection pool in Spring Boot. Instead of repeatedly establishing and tearing down expensive TCP database connections for each incoming HTTP request, HikariCP maintains an active pool of connections, dramatically reducing latency and improving throughput."),
         
        ("Q3: What does 'spring.jpa.hibernate.ddl-auto=update' do?",
         "Answer: It instructs Hibernate to automatically inspect all @Entity classes at startup and update the database structure (creating missing tables, adding new columns, creating foreign key constraints) while preserving all existing table records."),
         
        ("Q4: How does the backend communicate with the frontend?",
         "Answer: The frontend and backend communicate asynchronously over HTTP using RESTful endpoints. The frontend sends JSON payloads via Axios or Fetch API; Spring Boot controllers serialize and deserialize these payloads to Java DTOs/Entities using Jackson library."),
         
        ("Q5: How is relational data integrity maintained between Shops and Cities?",
         "Answer: In the Shop entity, a @ManyToOne relationship is defined with @JoinColumn(name = 'city_id'). Hibernate generates a foreign key constraint linking shops.city_id to cities.id, ensuring a shop cannot be saved with an invalid city reference.")
    ]
    
    for q, a in qa_list:
        h2 = doc.add_heading(q, level=2)
        h2.paragraph_format.space_before = Pt(8)
        h2.paragraph_format.space_after = Pt(2)
        h2.runs[0].font.color.rgb = RGBColor(30, 64, 175)
        p = doc.add_paragraph(a)
        p.paragraph_format.space_after = Pt(6)
        
    # Save document
    output_path = r"d:\orderapp\project info\Backend_Database_Architecture_and_Review_Guide.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    build_document()
