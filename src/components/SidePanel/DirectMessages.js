import React from "react";
import firebase from "../Firebase";
import {Menu, Icon } from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../Action';

class DirectMessages extends React.Component{
  state = {
    activechannel:'',
    user:this.props.currentUser,
    users:[],
    userRef:firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
  }

  componentDidMount(){
      if(this.state.user){
        this.addListeners(this.state.user.uid)
      }
  }
  componentWillUnmount(){
    this.removeListeners();
  }

  removeListeners = () =>{
    this.state.userRef.off()
    this.state.presenceRef.off()
    this.state.connectedRef.off()
  }


  addListeners = currentUseruid =>{
      let loadedusers = []

      this.state.userRef.on('child_added',snap =>{
          if(currentUseruid !== snap.key){
           let user=snap.val()
           user['uid'] = snap.key
           user['status'] = 'offline';
           loadedusers.push(user);
           this.setState({users:loadedusers});
         }
      });

      this.state.connectedRef.on('value',snap=>{
            if(snap.val()===true){
                const ref = this.state.presenceRef.child(currentUseruid)
                ref.set(true);
                ref.onDisconnect().remove(err=>{
                    if(err !== null){
                      console.log(err)
                    }
                })
            }
        });

      this.state.presenceRef.on('child_added', snap =>{
                if(currentUseruid !== snap.key){
                      this.addStatusToUser(snap.key);
                }



        });

      this.state.presenceRef.on('child_removed', snap =>{
            if(currentUseruid !== snap.key){
              this.addStatusToUser(snap.key,false);
            }
        });

  }

 addStatusToUser  = (userId,connected = true) =>{
    const updatedUsers = this.state.users.reduce((acc,user) => {
        if (user.uid === userId){
          user['status'] = `${connected ? 'online': 'offline'}`
        }
        return acc.concat(user)
    },[])

    this.setState({users:updatedUsers})

 }

  isUserOnline = user => user.status === 'online'

  changeChannel = user =>{
    const channelId = this.getChannelId(user.uid);
    const channelData={
      id:channelId,
      name:user.displayName
    };
    this.props.setCurrentChannel(channelData);
    console.log("entered state")
    this.props.setPrivateChannel(true)
    this.setState({activechannel:user.uid})
  }

  getChannelId = userId =>{
    const currentUserId = this.state.user.uid;
    return userId < currentUserId ? `${userId}/${currentUserId}`: `${currentUserId}/${userId}`
  }

  render(){
    const {users,activechannel} = this.state

    return(

        <Menu.Menu className="menu" >
        <Menu.Item style={{color:'white'}}>
          <span>
                <Icon name="mail"/> DIRECT MESSAGES
          </span>
          &nbsp;&nbsp;
          ({users.length})
        </Menu.Item>
         {users.map(user =>(
           <Menu.Item
            key={user.uid}
            onClick = {() => this.changeChannel(user)}
            active= {user.uid === activechannel?true:false}
            style={{opacity:0.7, fontStyle:'italic',color:'white'}}
            >
            <Icon
            name = "circle"
            color = {this.isUserOnline(user)? "green":"red"}
            />
            {user.displayName}
            </Menu.Item>
         ))}
        </Menu.Menu>
    )
  }
}


export default connect(null, {setCurrentChannel,setPrivateChannel})(DirectMessages);
