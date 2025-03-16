CREATE TABLE saved_sem (
sem_id SERIAL PRIMARY KEY
save_id INT,
CONSTRAINT fk_degree FOREIGN KEY (save_id)
REFERENCES saved_degree(save_id)
courses INTEGER[],
sname VARCHAR(50) NOT NULL
);