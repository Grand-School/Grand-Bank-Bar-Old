const nativefier = require('nativefier').default;

const options = {
    name: 'Grand Bank Bar',
    targetUrl: 'http://localhost:3000',
    icon: __dirname + 'icon.ico',
    insecure: true,
    win32metadata: {
        CompanyName: 'Grand Liceum',
        FileDescription: 'Application for bar for working with Grand Bank',
        OriginalFilename: 'Grand Bank Bar',
        ProductName: 'Grand Bank Bar',
        InternalName: 'Grand Bank Bar'
    }
}

nativefier(options, (error, appPath) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log('App has been nativefied to ' + appPath)
});