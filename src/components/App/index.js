import React from 'react';
import { Grid } from 'semantic-ui-react';
import ColorPanel from '../ColorPanel';
import SidePanel from '../SidePanel';
import Messages from '../Messages';
import MetaPanel from '../MetaPanel';
import './App.css';
import {connect} from 'react-redux';

const App = ({currentUser,currentChannel,isPrivateChannel,userPosts, primaryColor, secondaryColor}) =>(
    <Grid columns="equal" className="app" style={{background:secondaryColor,height:"100vh"}}>
    <ColorPanel
    key = {currentUser && currentUser.name}
    currentUser={currentUser}/>
    <SidePanel key={currentUser && currentUser.id} currentUser={currentUser}
    primaryColor={primaryColor}/>
    <Grid.Column style={{marginLeft:450, border:'10px'}}>
          {currentChannel==null?<Messages currentUser={currentUser} />:
        <Messages
        currentUser={currentUser}
        currentChannel={currentChannel}
        key={currentChannel.id}
        isPrivateChannel={isPrivateChannel}
        />}
    </Grid.Column>
    <Grid.Column width={4}>
          <MetaPanel
          currentChannel={currentChannel}
          userPosts={userPosts}
          key={currentChannel&& currentChannel.id}
          privateChannel={isPrivateChannel}/>
    </Grid.Column>
  </Grid>
);


const mapStateToProps = state => (
{
  currentUser: state.user.currentUser,
  currentChannel:state.channel.currentChannel,
  isPrivateChannel:state.channel.isPrivateChannel,
  userPosts:state.channel.userPosts,
  primaryColor:state.colors.primaryColor,
  secondaryColor:state.colors.secondaryColor
})

export default connect(mapStateToProps)(App);
