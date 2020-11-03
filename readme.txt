DATE : 02/11/2020

TO DO LIST:
  * IMPLEMENT STAGE 1 PART 1 TODAY
  
 
 
 
 
 use this when a a member log ins. This could be used to take the member to other pages and show different things
 to real memeber vs guests
 	{{#if authorised}}
				<a href="/logout">Log out</a>
			{{else}}
				<a href="/login">Log in</a>
			{{/if}}
  
  
  master