# bug-tracker project - (Sprint Sage)

## Description.

The Sprint Sage system enables student teams to manage software development projects, offering insights into individual and collective progress. It helps teams identify time-consuming areas, allocate resources efficiently, and share updates with peers and professors. Users can create tickets for course projects, detailing issues and their severity. Teams can then modify tickets by adding story points, assigning them, adding notes, and updating their status until completion.

Built with Angular CLI Version: 16.2.3
This application uses the MEAN Stack Architecture; M: MONGODB, E: EXPRESS, A: ANGULAR, N: NODE.

## Prerequisites

If you want to follow along, you have to be familiar with the following tools:

- Angular 16 and its core concepts, like components, templates, services, and modules.
- Material UI
- NodeJS and Typescript
- Visual Studio Code (optional)
- Angular CLI and JSON Server
- MongoDB.

To check if NodeJS and Angular CLI are already installed on your machine type in the following commands in your terminal or the integrated terminal of VS Code:

- node -v
- ng version

If these tools are not installed then this will give an error otherwise this will return the version number.
You will need to install the correct version of node for the project: ^18.10.0
To install NodeJS go to (Install [here](https://nodejs.org/en/download/)) and if you install NodeJS, npm will also get installed along with it.

You can install Angular CLI via the following command: npm install -g @angular/cli
Built with Angular CLI Version: 16.2.3
Check your angular version: ng v

json-server: comes prebuilt in package.json.

MongoDB (Install [her](https://www.mongodb.com/try/download/community))

MongoDB Server .env ref:

- LIVE_URL=http://localhost:4200
- PORT=8800
- MONGO_URL=mongodb://localhost:27017/SprintSageDB
- JWT_SECRET="enter token variable here" {used to validate token}
- EMAIL_USER="Enter valid email here" {used to reset password}
- EMAIL_PASS="Enter Api password" {used to reset password}

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

1. Clone the repository

```sh
git clone https://github.com/your-username/your-project-name.git
```

Navigate to the project directory

- cd your-project-name

Running the API application:

- navigate to api: cd api
- npm start

Running the Client application:

- navigate to client: cd client
- ng serve

Open your web browser and navigate to
http://localhost:4200/

Start playing...

Built With
Angular - The web framework used
npm - Dependency Management

Contributing
If you would like to contribute to this project, please feel free to fork the repository, create a feature branch, and open a pull request.

License
This project is licensed under the Loon Project Team - see the LICENSE.md file for details
