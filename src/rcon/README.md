## Usage

#### First establish connection

``` javascript
let Rcon = require('srcds-rcon');
let rcon = Rcon({
    address: '192.168.1.10',
    password: 'test'
});
rcon.connect().then(() => {
    console.log('connected');
}).catch(console.error);
```

#### Run commands

``` javascript
let rcon = require('srcds-rcon')({
    address: '192.168.1.10',
    password: 'test'
});

rcon.connect().then(() => {
    return rcon.command('sv_airaccelerate 10').then(() => {
        console.log('changed sv_airaccelerate');
    });
}).then(
    () => rcon.command('status').then(status => console.log(`got status ${status}`))
).then(
    () => rcon.command('cvarlist').then(cvarlist => console.log(`cvarlist is \n${cvarlist}`))
).then(
    () => rcon.command('changelevel de_dust2').then(() => console.log('changed map'))
).then(
    () => rcon.disconnect()
).catch(err => {
    console.log('caught', err);
    console.log(err.stack);
});
```

#### Specify command timeout

``` javascript
rcon.command('cvarlist', 1000).then(console.log, console.error);
```

#### Disconnect once finished

``` javascript
rcon.disconnect();
```
