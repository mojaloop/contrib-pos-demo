# central-services-shared
Shared code for central services

## Usage
### Logger 
To use the shared Logger class, you only need to require it in the file you want to perform logging in:

```
const Logger = require('central-services-shared').Logger
```

Then you simply need to call the appropriate method for the logging level you desire:

```
Logger.debug('this is only a debug statement')
Logger.info('this is some info')
Logger.warn('warning')
Logger.error('an error has occurred')
```

The Logger class is backed by [Winston](https://github.com/winstonjs/winston), which allows you to do things like [string interpolation](https://github.com/winstonjs/winston#string-interpolation):

```
Logger.info('test message %s', 'my string');
```

You can also call the Logger.log method which directly calls the Winston log method and gives even more flexibility.

By default, the Logger class is setup to log to the console only, with timestamps and colorized output.
