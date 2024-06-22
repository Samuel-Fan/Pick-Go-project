<!-- PROJECT SHIELDS -->
![Static Badge][NPM-shield]
![Static Badge][license-shield]
![Static Badge][react-shield]
![Static Badge][express-shield]
![Static Badge][nodejs-shield]
[![Static Badge][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Samuel-Fan/Pick-Go-project" name="readme-top"></a>
    <img src="https://github.com/Samuel-Fan/photo/blob/main/luggage.png" alt="Logo" width="80" height="80">
  </a>
  <h1 align="center">Pick-and-Go</h3>

   <p align="center">
    An awesome website to help you plan a trip!
    <br />
    <a href="https://pickgo.site/"><strong>Explore the website »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
## Table of Contents
<details>
  <summary>Click me</summary>
    <ol>
      <li>
        <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href='#overview'>Overview</a></li>
        <li><a href='#demo'>Demo</a></li>
      </ul>
    </li>
    <li>
      <a href="#built-with">Built With</a>
        <ul>
          <li><a href='#front-end'>Front end</a></li>
          <li><a href='#back-end'>Back end</a></li>
          <li><a href='#unit-test'>Unit test</a></li>
        </ul>
    </li>
    <li><a href="#system-architecture">System architecture</a></li>
    <li><a href="#database-relationship-diagram">Database relationship diagram</a></li>
    <li>
      <a href="#run-locally">Run locally</a>
        <ul>
          <li><a href='#front-end-install'>Front end</a></li>
          <li><a href='#back-end-install'>Back end</a></li>
          <li><a href='#run-unit-test'>Unit test</a></li>
        </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

### Overview
Traveling is a ubiquitous part of human life, offering a chance to unwind and recharge. However, planning a trip thoroughly can be quite challenging. I've often wished for a tool that could streamline the planning process, so I've taken it upon myself to create one.

This project is a "Travel Planning Website" developed using front-end and back-end technologies. Users can share their travel experiences, save and like attractions posted by others, and use these attractions to plan their trips. Additionally, users can find travel companions through the website.

I've completed the essential features that I designed for the project, but it's still in its early stages of development. Therefore, feel free to share any feedback or suggestions you may have. I hope you enjoy using it!

### Demo

With this website, you can:

* Share your memorable experiences from trip spots, such as exquisite restaurants or scenic viewpoints.
![gif1][gif1-url]

* Search and save spots shared by others.
![gif2][gif2-url]

* Utilize the spots you've saved or created to craft  new trip plans.
![gif3][gif3-url]

* Duplicate trips shared by others.
![gif4][gif4-url]

* Find potential trip partners.
![gif5][gif5-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Used Tech -->
## Built With

#### Front-end
* React - Frontend framework for creating user interfaces
* React-Router-dom - Routing & navigation
* Bootstrap - User interfaces libraries
  
#### Back-end
* Node.js - Runtime environment for JS
* Express.js - Node.js framework for building RESTful APIs
* MongoDB-Atlas - Multi-Cloud Database Service
* Mongoose - MongoDB object modeling tool designed to work in an asynchronous environment
* Passport.js - Authentication middleware for Node.js
* Passport-google-Oauth2.0 - Authenticating with Google using the OAuth 2.0 API
* Passport-JWT - Aauthenticating with a JSON Web Token
* Bcrypt.js - Library to help hash passwords
* Joi - Schema description language and data validator for JavaScript
* Multer - Middleware for handling image uploaded
* Imgur - Third-party API for saving image
* Redis - In-memory database for server side cache and rateLimit
* Object-hash - Generate hashes for query

#### Unit-test
* Mocha - JS test framework for quality assurance
* Chai - Assertion library
* SuperTest - JS library for testing RESTful APIs
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- system and database diagram -->
## System architecture
![system][system-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Database relationship diagram
![database][database-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- local storage -->
## Run locally

This is an example of how to list things you need to use the software and how to install them.

1. Clone this project to your local enviroment. 
```
git clone https://github.com/Samuel-Fan/Pick-Go-project.git
```
#### Front end
<a name="Front-end-install"></a>
1. Move to client folder
```
cd client
```

2. Install required packages
```
npm install
```

3. add an .env file in the client folder
```
touch .env
```

4. Set enviroment variable 
```
REACT_APP_API_URL='http://localhost:<Your server port number>'
```

5. Run it
```
npm start
```

#### Back end
<a name="back-end-install"></a>
1. You need to get your Imgur APi key.
2. You need to get GCP auth2.0 key if you want to use Google Authentication.
3. You need to get your Redis key. (https://app.redislabs.com)

4. Move to server folder
```
cd server
```

2. Install required packages
```
npm install
```

3. add an .env file in the server folder
```
touch .env
```

4. Set enviroment variable 
```
MONGODB_URL= <Your MongoDB URL>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
REDIRECT_URI='http://localhost:<Your client port number>'
SERVER_URI='http://localhost:<Your server port number>'
IMGUR_CLIENTID=
IMGUR_CLIENT_SECRET=
IMGUR_REFRESH_TOKEN=
IMGUR_ALBUM_ID=
REDIS_PASSWORD_USER=
REDIS_PASSWORD_OTHER=
```

5. And you have to set redis client in '/server/src/config/redis.js'
```
const redisClient_user = createClient({
  password: process.env.REDIS_PASSWORD_USER,
  socket: {
    host: <Your host String>,
    port: <Your port>,
  },
});
```

6. Run it
```
npm start
```

#### Unit test
<a name="run-unit-test"></a>
1. You have to run the server first
```
cd server
npm start
```

2. Run test
```
npm test
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

[MIT license](./License.txt)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Email - Samuel40411@gmail.com
<br />
Linkedin: [linkedin-url][linkedin-url]
<br />
<br />
Project Link: [https://github.com/Samuel-Fan/Pick-Go-project](https://github.com/Samuel-Fan/Pick-Go-project)
<br/>
Website Link: [https://pickgo.site/](https://pickgo.site/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- URL variables -->

[NPM-shield]: https://img.shields.io/badge/v10.2.3-orange?style=for-the-badge&logo=npm&label=NPM
[react-shield]: https://img.shields.io/badge/%5E18.3.1-%2361DAFB?style=for-the-badge&logo=react&label=REACT
[express-shield]: https://img.shields.io/badge/%5E4.19.2-%23000000?style=for-the-badge&logo=Express&label=Express
[nodejs-shield]: https://img.shields.io/badge/%5E20.10.0-%235FA04E?style=for-the-badge&logo=Node.js&label=Node.js
[license-shield]: https://img.shields.io/badge/LICENSE-MIT-green?style=for-the-badge
[linkedin-shield]: https://img.shields.io/badge/%20LINKEDIN%20-gray?style=for-the-badge&logo=linkedin
[linkedin-url]: https://www.linkedin.com/in/tzuhsienfan
[gif1-url]:https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20-%20gif-1.gif
[gif2-url]:https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20-%20gif-2.gif
[gif3-url]:https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20-%20gif-3.gif
[gif4-url]:https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20-%20gif-4.gif
[gif5-url]:https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20-%20gif-5.gif
[system-url]: https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20system%20diagram.PNG
[database-url]: https://github.com/Samuel-Fan/photo/blob/main/Pick%20%26%20Go%20database.png
