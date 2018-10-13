import React from 'react';
import { Platform, View, StyleSheet, Button, Text, StatusBar } from 'react-native';
import MapView from 'react-native-maps';
import { Constants, Location, Permissions } from 'expo';

import firebase from 'firebase';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyDhPkHYe62XDScfsbTp3ifP910YK32rGhA",
  authDomain: "digitize-hackathon.firebaseapp.com",
  databaseURL: "https://digitize-hackathon.firebaseio.com",
  projectId: "digitize-hackathon",
  storageBucket: "digitize-hackathon.appspot.com",
  messagingSenderId: "328433288607"
};

export default class LinksScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Map',
      headerRight: (
        <Button
          onPress={() => navigation.navigate('Report')}
          title="Report"
          color="#007AFF"
        />
      ),
    };
  };

  state = {
    location: null,
    errorMessage: null,
    db: null,
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }

    var app = firebase.initializeApp(firebaseConfig)
    var db = app.firestore()
    this.setState({db: db})

    db.settings({ timestampsInSnapshots: true }) // fix deprecation error

    db.collection("reports").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          console.log(doc.id);
          console.log(doc.data());
      });
     });
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };


  render() {
    let latitude = 0;
    let longitude = 0;
    if (this.state.location) {
      latitude = this.state.location.coords.latitude;
      longitude = this.state.location.coords.longitude;
    }
    if (this.state.errorMessage) {
      console.error(this.state.errorMessage)
    }
    return (
      <View style={styles.container}>
         <StatusBar barStyle="default" />
        <MapView
          style={styles.map}
          region={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.121,
          }}
        >
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
