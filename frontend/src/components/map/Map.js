import React from 'react'
import MapGL, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import StopMarker from '../map/StopMarker'

class Map extends React.Component {

  state = {
    zoom: 1,
    viewport: {
      latitude: 0,
      longitude: 0
    },
    clickedLocation: null,
    mapRef: null,
    autoTransition: false,
    searchingForGeolocation: false
  }

  componentDidMount = () => {
    // Sets a reference to the map so that it can be accessed for methods etc.
    this.setState({ mapRef: this.mapRef })
    // Get current location and go to position on map
    // this.goToCurrentPosition()
    if (this.props.flyTo) {
      this.flyTo(this.props.flyTo)
    }
  }

  goToCurrentPosition = () => {
    // Changes state for animation button whilst in progress
    this.setState({ searchingForGeolocation: true },
      navigator.geolocation.getCurrentPosition(data => {
        this.flyTo(data.coords)
        this.setState({ searchingForGeolocation: false })
      },
      () => alert('Please enable your GPS position feature.'),
      { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true }
      )
    )
  }

  flyTo = (coords) => {
    const { latitude, longitude } = coords
    this.setState({ autoTransition: coords }, () => {
      this.mapRef.getMap().flyTo({ center: [longitude, latitude], zoom: 11, speed: 2 })
      // Reset component viewport upon flyTo completion
      this.mapRef.getMap().on('moveend', () => {
        if (this.state.autoTransition) {
          const { latitude, longitude } = this.state.autoTransition
          this.setState({ viewport: { latitude, longitude }, autoTransition: false, zoom: 11 })
          this.setBounds()
        }
      })
    })
  }

  componentDidUpdate = () => {
    // Go to location on map if requested to by parent component
    // Only called once as the flyTo prop should always be nulled as a callback function to setState when used
    if (this.props.flyTo) {
      this.flyTo(this.props.flyTo)
    }
  }

  moveMapView = event => {
    // This if block stop the scroll zoom from moving the map
    if (event.zoom === this.state.zoom) {
      const { latitude, longitude } = event
      this.setState({ viewport: { latitude, longitude } })
    }
    this.setBounds()
  }

  // Gets NE and SW bounds of visible area
  setBounds = () => {
    if (this.state.mapRef && this.props.getBounds) {
      try {
        const bounds = this.state.mapRef.getMap().getBounds()
        this.props.getBounds(bounds)
      } catch (err) {
        console.log(err)
      }
    }
  }

  scrollToZoom = event => {
    const scrollSpeed = event.srcEvent.deltaY
    // Set scrolling dead zone
    if (Math.abs(scrollSpeed) < 1) return
    if ((this.state.zoom >= 20 && scrollSpeed < 0) || (this.state.zoom <= 1 && scrollSpeed > 0)) return

    // Get distance between mouse and center of map
    const difference = {
      latitude: event.lngLat[1] - this.state.viewport.latitude,
      longitude: event.lngLat[0] - this.state.viewport.longitude
    }
    // Set new viewport with respect to difference and scroll speed
    const viewport = {
      latitude: this.state.viewport.latitude + (difference.latitude * 0.0034 * -scrollSpeed ),
      longitude: this.state.viewport.longitude + (difference.longitude * 0.0034 * -scrollSpeed)
    }

    let zoom = this.state.zoom
    zoom -= 0.005 * scrollSpeed
    zoom = Math.max(Math.min(zoom, 20), 1)
    this.setState({ zoom, viewport })
  }

  placeMarker = ({ lngLat }) => {
    if (!this.props.getLocation) return

    const clickedLocation = {
      latitude: lngLat[1],
      longitude: lngLat[0]
    }
    // this.setState({ clickedLocation })
    this.props.getLocation(clickedLocation)
  }

  render() {

    const { zoom, viewport, clickedLocation, autoTransition, searchingForGeolocation } = this.state
    const { results, clickMarker, route } = this.props

    return (
      <MapGL
        ref={map => this.mapRef = map}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        mapStyle='mapbox://styles/sriramsiv/ckfqhispj079919t8xxbwa6t7'
        width={'100%'} height={'100%'}
        {...viewport}
        zoom={zoom}
        onViewportChange={this.moveMapView}
        onDblClick={this.placeMarker}
        getCursor={(() => 'arrow')}
        onWheel={this.scrollToZoom}
      >
        {route && route.stops.map((stop, i) => {
          // TODO fix this bug -> doesnt display the start location
          if (!stop) return null
          const marker =
            <Marker key={i} latitude={stop.location.latitude} longitude={stop.location.longitude}>
              <StopMarker number={i} altColor={stop.altColor} />
            </Marker>
          return marker
        })}
        {clickedLocation &&
          <Marker latitude={clickedLocation.latitude} longitude={clickedLocation.longitude}>
            <div className="marker" />
          </Marker>
        }
        {results && !autoTransition && results.map((place, i) => {
          const { latitude, longitude } = place.location
          const marker =
            <Marker key={i} latitude={latitude} longitude={longitude}>
              {place.selected
                ? <StopMarker />
                // TODO fix this crappy ternary
                : < div className="marker" onClick={clickMarker ? () => clickMarker(place) : null} />}
            </Marker>
          return marker
        })}
        <div className={`locator ${searchingForGeolocation ? 'searching' : ''}`} onClick={this.goToCurrentPosition}>
          <img src={require('../../images/locate.png')} alt="locate button"/>
        </div>
      </MapGL>
    )
  }
}

export default Map