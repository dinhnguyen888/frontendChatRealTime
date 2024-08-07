import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, IconButton, BottomNavigation, BottomNavigationAction, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import socket from '../services/socket'; // Ensure correct path
import { useUserStore } from '../stores/userStore';
import { Room, useRoomStore } from '../stores/roomStore';
import { useFriendStore } from '../stores/friendStore';
import Alert from '@mui/material/Alert';
import { useChatAppStore} from '../stores/countStateStore';

const FriendList: React.FC = () => {
  const {triggerReload, status,setRoomClicked, clickFriendRoom, setRoomData} = useChatAppStore()
  const [selectedTab, setSelectedTab] = useState(0);
  const [formTab, setFormTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<number | string | null>(null);
  const [friendId, setFriendId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const getUserData = useUserStore((state) => state.getUserData);
  const {getFriends,setFriends,addFriend} = useFriendStore()
  const {members, setMembers} = useRoomStore();
  const { friendRooms, chatRooms, setFriendRooms, setChatRooms,getFriendRooms,getChatRooms, addFriendRoom, addChatRoom } = useRoomStore();
  
  const userData = getUserData();
  const friends = getFriends();
  
  
  useEffect(() => {


    const userId = userData.id;
    if (userId) {
      socket.emit('showAllFriends', userId);
      socket.emit('getAllRoomById', userId);
      

      const handleAllFriendRooms = (data: { friendRooms: { _id: string; friendRoomName: string; }[], friends:{_id:string, name:string}[] }) => {
        const updatedFriendRooms = (data.friendRooms || []).map(room => ({
            id: room._id,
            name: userData ? room.friendRoomName.replace(userData.name, '') : room.friendRoomName,
            avatar: '/default-avatar.jpg'
        }));

        const updateFriends = (data.friends || []).map(friend => ({
          _id:friend._id,
          name: friend.name
        }))

        setFriends(updateFriends)
        setFriendRooms(updatedFriendRooms);

        console.log('check data from FriendList >>>>>>', data)
      };
    
      const handleAllRoomsById = (rooms: { _id: string; roomName: string }[]) => {
        const updatedRooms = (rooms || []).map(room => ({
          id: room._id,
          name: room.roomName,
          avatar: '/default-avatar.jpg',
          
        }));
        
        setChatRooms(updatedRooms);
      };

      const handleShowAllFriendsError = (error: string) => {
        console.error('Error fetching friends:', error);
      };

      const handleSendRequestError = (msg: string) => {
        alert(msg);
      };

      const handleJoinRoom = (msg: string) => {
        // alert(msg);
        console.log(msg)
      };

      const handleJoinFriendRoom = (msg: string) => {
        // alert(msg);
        console.log(msg)
      };

      socket.on('allFriends', handleAllFriendRooms);
      socket.on('allRoomsById', handleAllRoomsById);
      socket.on('showAllFriendsError', handleShowAllFriendsError);
      socket.on('sendRequestError', handleSendRequestError);
      socket.on('joinRoomSuccess', handleJoinRoom);
      socket.on('joinSuccess', handleJoinFriendRoom);

      return () => {
        socket.off('allFriends', handleAllFriendRooms);
        socket.off('allRoomsById', handleAllRoomsById);
        socket.off('showAllFriendsError', handleShowAllFriendsError);
        socket.off('sendRequestError', handleSendRequestError);
        socket.off('joinRoomSuccess', handleJoinRoom);
        socket.off('joinSuccess', handleJoinFriendRoom);
      };
    }
  }, [setFriendRooms, setChatRooms]);

  const handleClick = (room:Room) => {
    // setMembers(friends)
    // console.log('check friendMember>>>>>>>>>>>>', friends)
    setSelectedItem(room.id);
    setRoomClicked(room.id.toString())
    const userId = userData.id;
    
    if (selectedTab === 0) {
      socket.emit('joinFriendRoom', room.id);
      clickFriendRoom(true)
    } else {
      socket.emit('joinRoom', { roomId: room.id, personId: userId });
      setRoomData(room)
      console.log('check Room obj >>>>>>',room)
      clickFriendRoom(false)
    }
    triggerReload();
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedItem(null);
  };

  const handleFormTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setFormTab(newValue);
  };

  const handleSendFriendRequest = () => {
    const userId = userData.id;
    if (userId && friendId) {
      socket.emit('sendRequest', { to: friendId, from: userId });
    }
  };

  const handleCreateRoom = () => {
    const userId = userData.id;
    if (userId && roomName) {
      socket.emit('createRoom', roomName, userId);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFriendId('');
    setRoomName('');
  };

  const renderList = (items: typeof friendRooms | typeof chatRooms) => (
    <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
      <ListItemButton onClick={handleOpenDialog} sx={{ justifyContent: 'start' }}>
        <IconButton color="primary" aria-label="add friend or room">
          <AddIcon />
        </IconButton>
        <ListItemText primary="Add Friend or Room" />
      </ListItemButton>
      {items.map((item) => (
        <ListItemButton
          key={item.id}
          onClick={() => handleClick(item)}
          sx={{
            justifyContent: 'start',
            backgroundColor: item.id === selectedItem ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          }}
        >
          <ListItemAvatar>
            <Avatar src={item.avatar} alt={item.name} style={status ? {color:'green', backgroundColor:'lightcyan'} : {}} />
          </ListItemAvatar>
          <ListItemText primary={item.name} />
        </ListItemButton>
      ))}
    </List>
  );

  const renderDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>
        <Tabs value={formTab} onChange={handleFormTabChange} aria-label="form tabs">
          <Tab label="Add Friend" />
          <Tab label="Create Room" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {formTab === 0 ? (
          <TextField
            label="Friend ID"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        ) : (
          <TextField
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
        <Button
          onClick={formTab === 0 ? handleSendFriendRequest : handleCreateRoom}
          color="primary"
        >
          {formTab === 0 ? 'Send Friend Request' : 'Create Room'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {selectedTab === 0 ? renderList(friendRooms) : renderList(chatRooms)}
      </Box>
      <BottomNavigation value={selectedTab} onChange={handleTabChange} sx={{ borderTop: '1px solid #ddd' }}>
        <BottomNavigationAction label="Friends" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Chat Rooms" icon={<ChatIcon />} />
      </BottomNavigation>
      {renderDialog()}
    </Box>
  );
};

export default FriendList;
