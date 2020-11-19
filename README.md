# GA PROJECT 3: POPQUEST
### [VISIT SITE](https://pop-quest.herokuapp.com/)

### BRIEF

In a team of 4, create a full stack app using the MERN stack with a design and functionality of our own choosing.

In collaboration with [Donald Graham](https://github.com/dongra02), [Ren Mignogna](https://github.com/renato76) & [Liam Callaghan](https://github.com/LiamCallaghan)

### TIMEFRAME

8 days

### TECHNOLOGIES

* React
* JavaScript (ES6)
* Node.js
* MongoDB
* Mongoose
* HTML
* CSS
* Sass

### OUTLINE AND PLANNING

We wanted something that would provide enough to do on both the front and back ends in order to fully practice the full stack of technologies. Our favourite idea that emerged was an app that would allow users to create and consume guided tours or treasure hunts, based around location services and map components.

The app would allow users to create a list of stops on the map and attach various pieces of information to them. For example, you could attach a clue that leads to the next stop or simply a description for creating a guided tour.
In the case where the stops are linked together with clues, location services check a users current position to see if they have reached the correct location; this then allows the next clue to be viewed.

On the back end users and routes are linked through a series of relationships in order to see a users created routes, completed routes and other users that they are following.

We spent a good amount of time wire-framing the front end, with detailed designs for the index, create and route pages. This really payed off as when I started building the framework of the app it was very quick to put down the basic elements without having to rethink and rearrange as I went.

![](README/Screenshot%202020-11-17%20at%2011.30.38%203.png)

We finished the planning stage by creating a Trello board and all put as many tasks on there as we could think of, organising them into front and back end as well as basic and advanced categories. The plan was for me and Ren to work on the front end design while the others handled the database and API work.

### STYLING

We wanted to decide on a colour palette for the app early on so that the styling could be applied as we developed the functionality.  I chose a map style from the mapbox website and created a colour scheme based on it to create a consistent feel. I went through the process in this order as I knew that the maps would be the central component of the app and that everything  else should be complimentary to that.

![](README/Screenshot%202020-11-17%20at%2011.38.45%203.png)

### CREATING A MAP COMPONENT

The aspect of this project that I was most excited about was using maps from mapbox which would be used for displaying the available routes on the index page, helping to create routes by placing markers on the map and displaying the stops as the user followed the routes.

Setting up the map went smoothly and I was able to get the data from the backend showing up as pins on the map without any problems. The first major challenge was filtering the data so that only results that were visible on the map would be loaded. The idea was to use this filtered list to display the routes besides the map and allow the user to essentially search by moving the map.

After digging around the docs a discovered that the mapbox  object (rather than the react wrapper of the component) could be accessed directly in order to use the methods in the original API. I learned that React components could be assigned to variables in order to access them from within the components methods. This took me a little while to get my head around as it seemed to go against the philosophy of React, but it did prove invaluable when working with third party components when the desired functionality was not exposed.

```jsx
// Set reference to map object
<MapGL
        ref={map => this.mapRef = map}
// Accessing mapbox methods
this.mapRef.getMap().flyTo({ center: [longitude, latitude], zoom: 11, speed: 2 })
```

Now that I had access to the map object I could request the current bounds  of the visible map which was returned as a pair of latitude / longitude values - one for the north-east corner and one for the south-west. They could be reorganised easily to represent the min/max for both latitude and longitude. With this information I could then check whether each result lay between the bounds and filter it out of the results if not.

```javascript
const results = allQuests
      // Filter by visible area of map
      .filter(result => {
        const location = result.stops[0].location
        const inLat = location.latitude > bounds.latitude[0] && location.latitude < bounds.latitude[1]
        const inLng = location.longitude > bounds.longitude[0] && location.longitude < bounds.longitude[1]
        return inLat && inLng
      })
```

The next addition was custom markers. I spent a lot of time working on these and experimented with a few different styles. What I wanted to achieve was a component that was self-contained and able to be used with a small collection of props, such as size, colour and label.

I ended up styling the markers entirely out of CSS so that no external image files were needed. This took a lot of tweaking to get right but the end result was quite satisfying as the CSS was all hidden away in the components JavaScript, so that the implementation into the map looked quite clean.
The final version was able to be set with custom colour, a number for the label (with a different style for no label), an alternate style (filled in, can be used for hover state) and size.

This is one of my favourite results from the project as I think that the final component can potentially be implemented by other developers in their work in a reusable manner.

### CREATING AND EDITING ROUTES

The next major task was to create the route editor component, building on top of the map component.
The idea was to provide an input for the basic settings of the route (theme, estimated time, title, etc.) and then have a list of stops that the user could add to using a separate form to input the location, name and other data.

I wanted to have the ability to select the location of a new stop either by using a search input or by clicking on the map. I had already implemented a search function using a third party geocoder component.; this worked for setting the location but did not display a marker on the map.

I started by simply passing the location as a prop to the map but found that once the route was displaying multiple stops that I was passing in lots of very similar props for markers on the map. I spent some time refactoring the code for the map so that markers could be passed in for various purposes (displaying routes, stops, clicked locations) by passing in the information as an object with all the possible options that could be used and setting defaults for when they weren’t necessary.

Once I had that working correctly I then discovered a really tricky bug that meant that the geocoder label could not be updated externally; this meant that if the user clicked a location it would show up in the search bar, but changing the location after that would have no effect.

I spent many hours with another team member trying to locate the reason for this behaviour and found eventually that  the input value could only be set on the initial mount of the component. After trying many, many different solutions I wondered whether we could remount the component. If I could do this I could then easily just change the initial value and remount to update the displayed value. A quick search showed that this wasn’t a built in feature but could be triggered by taking advantage of the way that React tracks components using keys; because the key is a unique value, if I just changed the key value, React would think that the component was a entirely new component and unmount the ‘old’ one before remounting the ‘new’ one, effectively remounting it.

```javascript
refreshGeocoder = () => {
    // Toggle key between 1 and 0
	  const geocoderKey = (this.state.geocoderKey + 1) % 2
    this.setState({ geocoderKey })
  }
```

### DESIGNING ROUTE TYPES

During the building and testing of the route creator, the question arose of how to differentiate different route types. In the initial designs we had planned to include an attribute on the routes for theme - this would be used solely for helping to search for routes and choice would be totally up to the user without any restrictions.

The stops on the quest type routes are all linked together linearly because the ‘answer’ for a stop is the location of the next one. Because of this, the two different types (quest and tour) need to have slightly different inputs available on creation.

I decided to remove the idea of themes and use that part of the model to define the route type instead. The user is now prompted to choose the type when first creating a route and then is presented with a different form for creating stops based on that type.

I wrote a function in order to check a players proximity in order to complete the functionality of the quests. The player can double click on the map where they believe the next stop to be (rather than using geolocation due to testing the app using desktop) and when they click the answer button this function is called. It takes the guess location data and triangulates the distance to the next stop after converting LatLng to meters. The creator can choose the leniency for this check when designing each stop to allow for more or less specific answers.

The quest routes also show a timer when playing in order to add an extra challenge to them or allow for competitive play. This timer also runs on tour routes but is not visible and the data from completion times is used to update the estimated time for each route.

![](README/route-creator%203.gif)

### CONCLUSION & KEY LEARNINGS

The main lesson for me on this project was the work flow of collaborating with other developers. Working with GitHub and getting comfortable with it took us a couple of days and some headaches at the start but once we clicked with it, I was amazed at how streamlined it made everything. This feels especially relevant in a situation where we were all working remotely and had to rely on the versioning and communication tools.

I was excited to delve into the world of third party React packages on this project and while I was satisfied with the results of using them, I think I learnt a lot in dealing with the restrictions that they sometimes imposed on me and in using developer tools to tease apart the inner workings in times where the documentation was lacking.

### FUTURE IMPROVEMENTS

At the end of the week I felt that we had managed to build all of the basic functionality of the app and that it could be used in its intended manner. I was particularly pleased with the work on the route creator and the consistency of the apps visual design & responsiveness.

There are some extra features that I would have liked to include. The main one is a leaderboard for the quest times of each user. We currently collect the data for the completion time and use it to update the estimated time for the route so a leaderboard display would have been a quite straightforward addition. I also would have liked to include the ability to follow creators and flesh out the community aspect of the app in general.





