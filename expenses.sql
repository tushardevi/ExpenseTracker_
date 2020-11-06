CREATE TABLE IF NOT EXISTS expenses(
  expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
  userid INTEGER,
  
  -- for stage 1: part 1, I only need to add 3 attributes
  expense_date DATE,
  label TEXT NOT NULL,
  amount INTEGER NOT NULL,
  FOREIGN KEY(userid) REFERENCES users(id)   -- id from table users is used to retrieve expenses for every user.
  

);





-- random values to test the database

INSERT INTO expenses(userid, expense_date,label,amount)
  VALUES(22,"01/11/2020"," ",20.50);
  
INSERT INTO expenses(userid, expense_date,label,amount)
  VALUES(24,"01/10/2020"," ",59.99);

INSERT INTO expenses(userid, expense_date,label,amount)
  VALUES(5,"01/09/2020"," ",120.50);
  
  
  

-- INSERT INTO contacts(userid,firstname,lastname,company,url,photo,lastcontact)
--   VALUES(24,"Fred","Flinstone","hanna honanaa","https://www.youtube.com","image_2.jpg",CURRENT_TIMESTAMP);




