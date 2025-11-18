-- Agregar ON DELETE CASCADE a las relaciones

-- Primero eliminar las constraints existentes
ALTER TABLE comments DROP CONSTRAINT IF EXISTS "FK_professors_comments";
ALTER TABLE professors DROP CONSTRAINT IF EXISTS "FK_universities_professors";

-- Agregar las constraints con ON DELETE CASCADE
ALTER TABLE comments 
ADD CONSTRAINT "FK_professors_comments" 
FOREIGN KEY (professor_id) 
REFERENCES professors(id) 
ON DELETE CASCADE;

ALTER TABLE professors 
ADD CONSTRAINT "FK_universities_professors" 
FOREIGN KEY (university_id) 
REFERENCES universities(id) 
ON DELETE CASCADE;
