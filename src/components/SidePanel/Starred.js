import React from "react";
import firebase from '../Firebase';
import {Menu, Icon} from "semantic-ui-react";
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../Action';
class Starred extends React.Component{
  state = {
    activeChannel:'',
    starredChannels:[],
    usersRef:firebase.database().ref('users'),
    user:this.props.currentUser
  }

  changeChannel= channel =>{
      this.props.setCurrentChannel(channel);
      this.props.setPrivateChannel(false)
      this.setState({activechannel:channel.name})

  }

  componentDidMount(){
    if(this.state.user){
        this.addStarListner(this.state.user)
    }
  }

  componentWillUnmount(){
      this.removeListener();
  }

  removeListener = () =>{
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  }

  addStarListner = user =>{
    console.log('listnening')
    this.state.usersRef
    .child(user.uid)
    .child('starred')
    .on('child_added',snap =>{
      console.log("addon")
      const starredChannel = {id:snap.key, ...snap.val()}
      this.setState({
        starredChannels:[...this.state.starredChannels,starredChannel]
      })
    })

    this.state.usersRef
    .child(user.uid)
    .child('starred')
    .on('child_removed',snap=>{
      const channelToRemove = {id:snap.key, ...snap.val()}
      const filteredChannels = this.state.starredChannels.filter(channel =>{
        return channel.id !== channelToRemove.id;
      })
      this.setState({starredChannels:filteredChannels})
    })
  }

  displayChannel= starredChannels =>(

      starredChannels.length > 0 && starredChannels.map(channel=>
        (
          <Menu.Item
          key = {channel.id}
          onClick = {() =>this.changeChannel(channel)}
          name={channel.name}
          style={{color:'white',opacity:0.7,cursor:'pointer'}}
          active={this.state.activechannel===channel.name?true:false}>
          #{channel.name}
        </Menu.Item>
      ))
    )

  render(){
    const {starredChannels} = this.state
    return(
      <Menu.Menu className="menu" >
      <Menu.Item style={{color:'white'}}>
          <span>
              <Icon name="star"/> STARRED{' '}
          </span>
      ({starredChannels.length})<Icon name='add' style={{cursor:'pointer'}}onClick={this.openModal}/>
      </Menu.Item>
      {this.displayChannel(starredChannels)}
      </Menu.Menu>
    )
  }
}


export default connect(null,{setCurrentChannel,setPrivateChannel})(Starred)
