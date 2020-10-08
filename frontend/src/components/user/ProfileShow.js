import React from 'react'
import { getSingleProfile } from '../../lib/api'
import { Link } from 'react-router-dom'
import { isAuthenticated } from '../../lib/auth'
import BgMap from '../map/BgMap'

class ProfileShow extends React.Component {
  state = {
    profile: '',
    isUser: false
  }

  bgLatLng = [
    (Math.random() * 180) - 90,
    (Math.random() * 360) - 180
  ]

  componentDidMount = async () => {
    const profileId = this.props.userId ? this.props.userId : this.props.match.params.id
    const isUser = this.props.userId ? true : false
    const response = await getSingleProfile(profileId)
    this.setState({ profile: response.data, isUser })
  }

  deleteQuest = () => {
    console.log('TODO delete quest')
  }

  render() {

    const { isUser, profile } = this.state
    if (!profile) return null

    return (
      <>
        <BgMap latLng={this.bgLatLng} />
        <div className="profile">
          <div className="profile-details">
            <img src={profile.imageUrl} alt='Profile' />
            <h3 className="title-text">{profile.username}</h3>
          </div>
          <div className="profile-quests">
            {profile.createdQuest.map((quest, i) => (
              <div key={i} className='container-quest'>
                <Link to={`/quests/${quest.id}`} className="title">{quest.name}</Link>
                <div className="detail-theme">{quest.theme}</div>
                <div className="detail-rating">{quest.avgRating}</div>
                <div className="quest-buttons">
                  <Link to={`/quests/edit/${quest.id}`}>
                    <button className={isUser ? '' : 'hide'}>edit</button>
                  </Link>
                  <button className={isUser ? '' : 'hide'} onClick={() => this.deleteQuest(quest.id)}>
                    delete
                  </button>
                  <Link to={`/quests/${quest.id}`}>
                    <button>play</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }
} 

export default ProfileShow