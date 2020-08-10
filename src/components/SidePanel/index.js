import React from 'react';
import {Menu} from 'semantic-ui-react';
import Userpanel from './Userpanel';
import Channels from './Channel';
import DirectMessages from "./DirectMessages";
import Starred from './Starred';

class SidePanel extends React.Component{

    render(){
      const {currentUser,primaryColor} = this.props;
      return(
          <Menu
          size="large"
          fixed="left"
          vertical
          style={{background:primaryColor, fontSize:'1.2rem'}}>
            <Userpanel currentUser={currentUser} primaryColor={primaryColor}/>
            <Starred currentUser={currentUser}/>
            <Channels currentUser={currentUser}/>
            <DirectMessages currentUser={currentUser} />
          </Menu>
      )
    }
}

export default SidePanel;
