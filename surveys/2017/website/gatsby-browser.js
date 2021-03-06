import ReactGA from 'react-ga'
ReactGA.initialize('UA-83022212-4')

const ascii = `
                                                                                           
                                                  /\\                                       
                                    ----+----    /  \\     ----+----                        
                  +----+  +-------      |       /    \\        |      +-------  +----+      
                  |the |  |             |      /------\\       |      |         | of |      
                  +----+  +------+      |     /        \\      |      +-----    +----+      
                                 |      |                     |      |                     
         +-----+-+-----+  -------+      |      +----+         |      +-------              
         +-----+ +-----+                     +-+----+-+                  ( )          ++   
               | |                           | |                          '           ||   
               | |   +--+  +-+   +-+  +--+   | |         ++---+ +-+/--+ +++  +++--++  |+--+
               | | +++--+++ \\\\   // +++--+++ +-+----+   +++---+ +-----+ ++|  ||+--+++ |+--+
               | | ||    ||  \\\\ //  ||    ||   +----+-+ ||        ||     ||  ||    || ||   
               | | +++--+||   \\V/   +++--+||        | | +++---+ +-++-+  +++-+||+--+++ ++--+
               | |   +--+++    V      +--+++        | |  ++---+ +----+  +---+||+--++   +--+
               +-+                           +-+----+-+                      ||            
       +-+-----++                              +----+                        ||            
         +-----+            /\\/\\    -----+                +---+    /\\/\\      ++            
                           / /  /        |   +----+   |   |   |   \\  \\ \\                   
                           \\/\\ /    +----+   |    |   |       |    \\ /\\/                   
                              /     |        |    |   |       |     \\                      
                             /      |        |    |   |       |      \\                     
                                    +-----   +----+   |       |                            




Will you be wise enough to escape the JavaScript Jungle? Take the challenge to find out!

http://bit.ly/2yVkZNc

`
exports.onClientEntry = () => {
    console.log(ascii)
}

exports.onRouteUpdate = ({ location }) => {
    ReactGA.pageview(location.pathname)
}
