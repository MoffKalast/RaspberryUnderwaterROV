const BMP280 = require('./bmp280.js');
const options = {
  i2cBusNumber  : 1,    // defaults to 1
  i2cAddress    : 0x76, // defaults to 0x76
  verbose       : true
};
const bmp280 = new BMP280(options);

bmp280.config({
  powerMode: 1,
  pressureOversampling: 3,
  temperatureOversampling: 1,
  iirFilter: 2,
  standby: 4
});

console.log(`Reading sensors`);
bmp280.readSensors()
  .then((data) => {
    console.log(`Temperture:\t${data.Temperature}`);
    console.log(`Pressure:\t${data.Pressure}`);
  })
  .then(() => {
    bmp280.close();
  })
  .catch((err) => {
    console.log(err);
    bmp280.close();
  });

process.on('SIGINT', () => {
  bmp280.close();
  process.exit();
});
