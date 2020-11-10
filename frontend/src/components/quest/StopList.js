import React from 'react'
import icons from '../../lib/icons'

const StopList = (props) => {
  const { stops, changeTab, deleteStop } = props
  

  return (
    <div className="stop-list">
      {stops.map((stop, i) => (
        <div key={i} className="stop-list-item">
          <div>{stop.name}</div>
          <div className="stop-list-buttons">
            <button onClick={() => changeTab('addStop', i)}>{icons.editIcon}</button>
            <button onClick={() => deleteStop(i)}>{icons.deleteIcon}</button>
          </div>
        </div>
      ))}
      <div className="create-button">
        <button onClick={() => changeTab('addStop')}>Add Stop</button>
      </div>
    </div>
  )
}

export default StopList