CREATE TABLE IF NOT EXISTS contacts(
  id INTEGER PRIMARY KEY AUTOINCREMNET,
  
  userid INTEGER,
  photo TEXT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  company TEXT,
  url TEXT,
  lastcontact INTEGER,
  FOREIGN KEY(userid) REFERENCES users(id)
  

);


INSERT INTO contacts(userid,firstname,lastname,company,url,photo,lastcontact)
  VALUES(1,"Micky","Mouse","Disney","https://disney.co.uk","image_1.jpg",CURRENT_TIMESTAMP);

INSERT INTO contacts(userid,firstname,lastname,company,url,photo,lastcontact)
  VALUES(2,"Fred","Flinstone","hanna honanaa","https://www.youtube.com","image_2.jpg",CURRENT_TIMESTAMP);

