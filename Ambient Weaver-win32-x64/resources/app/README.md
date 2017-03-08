### To My Future Self

*A note about the modules/ and node_modules/ directories...*

I figured that it would be a good idea to leave myself a note since working with NodeJS can be a bit of a pain. The `src/modules` directory contains directories with a `*.js` file and a `packge.json` file. Since I was having trouble getting local modules to work using the `require()` method, I created those directories as well as matching directories in the `node_modules` directory. The only problem is, I don't want to have the actual JS files for each of the modules in the `node_modules` directory, since I've got `node_modules` on my `.gitignore` list. The `packge.json` files are simply there as a backup in case the one in the `node_modules` directory is borked.

The `"main"` property of the object in the package.json file of each module indicates the location of the main JS file for that module, relative to the `node_modules` directory.

Hope that helps!