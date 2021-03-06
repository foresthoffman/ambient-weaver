Ambient Weaver
================

*Note (macOS only):* There appears to be a (good) security feature within macOS Sierra that is causing the application to utilize a read-only portion of the hard drive. The fix is to simply move the application anywhere else on the computer, after downloading. If your track folder is being automatically assigned to a location starting with "/private/var/", then the previous step should do the trick.

### What?...Why?

Ambient Weaver is a desktop application, for 64-bit macOS 10.12.2 and Windows 10, designed to solve issues related to playing ambient noise tracks. Ambient tracks are best played in a loop, but doing so with an individual track can be troublesome. The not-so-subtle momentary breaks between iterations of a loop can easily break a listener's focus. Using ridiculously long tracks can make loop-breaks less frequent, but that doesn't fix the problem. Ambient Weaver is built from the ground up with the idea that multiple tracks can be woven together to create a seamless listening experience.

### Features

* Create playlists
* Add tracks to playlists
* Configure, save, and restore playlist settings
 * Customize track:
  * Volume
  * Starting time
  * Loop status
* Customize track folder location

Recognized audio file formats: `mp3, m4a, ogg, wav`.

### Attribution

The audio files that are provided in the `default/` folder within the apps' resource folders are modified versions of the edited tracks that Gabriel Martin (gabriel at asoftmurmur dot com) used in his ["A Soft Murmur"](http://asoftmurmur.com/) ambient sound web app. The original audio files come from the following places under various versions of the CC license.

* [Fireplace](http://www.freesound.org/people/inchadney/sounds/83986/) by inchadney
* [Fireplace #2](http://www.freesound.org/people/inchadney/sounds/132534/) by inchadney
* [Strong wind in the forest](http://www.freesound.org/people/inchadney/sounds/105272/) by inchadney
* [Rain late at night](http://www.freesound.org/people/Kyster/sounds/122117/) by Kyster
* [Rainstorm](http://www.freesound.org/people/klangfabrik/sounds/194209/) by klangfabrik

### Tech

This native application was built using [Electron](https://github.com/electron/electron) from GitHub. In addition to [Bootstrap](http://getbootstrap.com/) and [jQuery](https://jquery.com/).

### License

[MIT](https://github.com/foresthoffman/ambient-weaver/blob/master/LICENSE.txt)