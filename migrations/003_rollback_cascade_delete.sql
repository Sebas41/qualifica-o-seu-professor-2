-- Revertir las constraints de cascada

-- Eliminar las constraints con cascada
ALTER TABLE comments DROP CONSTRAINT IF EXISTS "FK_professors_comments";
ALTER TABLE professors DROP CONSTRAINT IF EXISTS "FK_universities_professors";

-- Restaurar las constraints sin cascada
ALTER TABLE comments 
ADD CONSTRAINT "FK_professors_comments" 
FOREIGN KEY (professor_id) 
REFERENCES professors(id);

ALTER TABLE professors 
ADD CONSTRAINT "FK_universities_professors" 
FOREIGN KEY (university_id) 
REFERENCES universities(id);
