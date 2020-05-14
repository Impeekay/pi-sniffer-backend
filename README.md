### Pi Sniffer Backend

#### The Backend server code to store all the frames coming from the raspberry pi and also enable api's interaction for the same.

#

##### Steps to run this backend

- clone this repo
- ensure node.js is installed (used version: lts(12.14.0))
- run `npm install`
- add `main.js` in config directory
- ```
    module.exports = {
        clientUrl: "frontend service",
        port: 3000,
        mqttUsername: "mqtt service username",
        mqttPassword: "mqtt service password ",
        mqttHost: "mqtt service host",
        mqttPort: mqtt service port,
        mqttTopics: ["frame_topic","cache_frame_topic"]
    };
  ```
- add `config.js` in config directory
- ```
    module.exports = {
    development: {
      username: "someUser",
      password: "somePassword",
      database: "someDatabase",
      host: "someHose",
      dialect: "postgres",
      logging: false,
      pool: {
        max: 5,
        idle: 10000,
      },
    }
  };
  ```

- run `node index.js`
