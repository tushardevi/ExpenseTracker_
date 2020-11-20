CREATE TABLE IF NOT EXISTS expenses(
  expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- for stage 1: part 2, now i need 6 attributes
  expense_date INTEGER,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  descrip TEXT NOT NULL,
--   img_url TEXT,
  amount INTEGER NOT NULL,
  userid INTEGER,
  FOREIGN KEY(userid) REFERENCES users(id)   -- id from table users is used to retrieve expenses for every user.
  

);



-- random values to test the database


INSERT INTO expenses(userid, expense_date,label,amount,descrip,category)
  VALUES(5,CURRENT_TIMESTAMP,"Picnic",120.50,"holiday","luxury");
  
-- INSERT INTO expenses(userid, expense_date,label,amount,descrip,img_url,category)
--   VALUES(5,CURRENT_TIMESTAMP,"Party",20.50,"Pub night","avatr.png","Luxury");
  
-- INSERT INTO expenses(userid, expense_date,label,amount,descrip,img_url,category)
--   VALUES(5,CURRENT_TIMESTAMP,"Car",20.50,"car bought","avatr.png","Other");
  
  
  
-- INSERT INTO expenses(userid, expense_date,label,amount)
--   VALUES(24,"01/10/2020"," ",59.99);

-- INSERT INTO expenses(userid, expense_date,label,amount)
--   VALUES(5,"01/09/2020"," ",120.50);
  
  
  

-- INSERT INTO contacts(userid,firstname,lastname,company,url,photo,lastcontact)
--   VALUES(24,"Fred","Flinstone","hanna honanaa","https://www.youtube.com","image_2.jpg",CURRENT_TIMESTAMP);




