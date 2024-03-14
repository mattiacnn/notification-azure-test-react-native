import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import 'node-libs-react-native/globals';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import '@azure/core-asynciterator-polyfill'
import { createFcmV1Installation, NotificationHubsClient } from "@azure/notification-hubs";
import CryptoJS from 'crypto-js';


const credentials = [
  {
    system: "ios",
    userAccessToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjY5ZWNjOWE4LTJmZWEtNDYwOS1iODVjLTAzY2JkMTMwNTY2MF8wMDAwMDAxZS1kM2EyLTkzNzgtZjRmMy1hZDNhMGQwMGVhMzIiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTAyNjUyNjYiLCJleHAiOjE3MTAzNTE2NjYsInJnbiI6ImRlIiwiYWNzU2NvcGUiOiJjaGF0IiwicmVzb3VyY2VJZCI6IjY5ZWNjOWE4LTJmZWEtNDYwOS1iODVjLTAzY2JkMTMwNTY2MCIsInJlc291cmNlTG9jYXRpb24iOiJnZXJtYW55IiwiaWF0IjoxNzEwMjY1MjY2fQ.IcjekuruZzsdhcVkFlBgj3g2mPHKV9cP42C8iLK0WU0HHBPMKTeicm8UtQGwvCUfo5-gzZEXe3t97-JlxHNEGlwTtFrQSTGEXrRGASkcvHFwCjd8pnQLNLmaWiVrm29OxTQldMjwIZrLQRYSGRwlR609RNJFgfM4WOnGQCfgWY-3aqbHJFeDV_p0Vz_oVe_ChMrADXSZhcSntmiNR7rJntnZxdFG6S8jUYNXm80sr6JXgkcevGHC6fg3l0pBCzXEOQ5xSBLPusugZsWHQiiGjWWq98Fy6PlCsbECZT8RRjH6EDu126zLxwzJ_7BzVWP56-uMUrPSHDOjNuXpGlMS6g",
    identity: "8:acs:69ecc9a8-2fea-4609-b85c-03cbd1305660_0000001e-d3a2-9378-f4f3-ad3a0d00ea32"
  },
  {
    system: "android",
    userAccessToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjY5ZWNjOWE4LTJmZWEtNDYwOS1iODVjLTAzY2JkMTMwNTY2MF8wMDAwMDAxZS1kM2EzLTU0N2MtZjVmNC1hZDNhMGQwMGU1Y2MiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTAyNjUzMTUiLCJleHAiOjE3MTAzNTE3MTUsInJnbiI6ImRlIiwiYWNzU2NvcGUiOiJjaGF0IiwicmVzb3VyY2VJZCI6IjY5ZWNjOWE4LTJmZWEtNDYwOS1iODVjLTAzY2JkMTMwNTY2MCIsInJlc291cmNlTG9jYXRpb24iOiJnZXJtYW55IiwiaWF0IjoxNzEwMjY1MzE1fQ.eE9fwlcHTfCBaKNmUihj7qIITljehxPrel2l0Pmy208sXgKum4y7IHjC9CfliElQI7malCp4_yirzi0WVJZxBw2hz0ZB7ZYSacT-oYWgzw4fPXszRFCiUu4U8gS1LR_lTU_UHHtEB0YaLYDC2vZkBc-Ojas_HDR8ftVJ7g5Vuij-wUxm2Eo9zfzLrocCGdiHHKbGod3krtGeAgl6l8iMVFXcSnIKAX2wegesawWqWClI79U6v3SRbJFM15LovA_R3ggOAetDWL_65tKFtUH30gpJ7sRQABuwp_ui4lRldytL_QopIAsYXCqF_8zt7wEZu5zMZTa0Bj9pPOvd1NmdIg",
    identity: "8:acs:69ecc9a8-2fea-4609-b85c-03cbd1305660_0000001e-d3a3-547c-f5f4-ad3a0d00e5cc"
  }
]

const getCredentials = (system) => {
  return credentials.find(cred => cred.system.toLowerCase() === system.toLowerCase());
}

export default function App() {
  const [deviceToken, setDeviceToken] = useState('');

  let endpointUrl = 'https://prova-comunicazioni.germany.communication.azure.com/';
  let userAccessToken = getCredentials('android').userAccessToken;

  const getTokenFromExpo = async () => {
    const { status: existingStatus, } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getDevicePushTokenAsync()).data;

    const client = new NotificationHubsClient("Endpoint=sb://prova-notifiche.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=goRKjoRC4Qej9AAbtzcDACmxhhWsCpXoWY7eIjf84ww=", "'prova-notifiche");
    const installation = createFcmV1Installation({
      installationId: CryptoJS.SHA256(token).toString(),
      pushChannel: token,
      tags: ["likes_javascript"],
    });

    installation = await client.createOrUpdateInstallation(installation);
    console.log("installation", installation);
    setDeviceToken(token);
  };

  const registerForNotifications = async (system) => {
    const request = {
      installationId: "",
      platform: system === 'iOS' ? 'apns' : 'fcm',
      pushChannel: deviceToken,
      tags: []
    };
  }

  async function createChatThread() {
    console.log('Creating chat thread...', userAccessToken);
    let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
    console.log('Azure Communication Chat client created!', chatClient);

    const system = Device.osName.toLowerCase() === 'ios' ? 'android' : 'ios';
    const identity = getCredentials(system).identity;
    console.log("creating thread with identity: ", identity);

    const createChatThreadRequest = {
      topic: "Hello, World!"
    };
    const createChatThreadOptions = {
      participants: [
        {
          id: { communicationUserId: identity },
          displayName: 'Mattia'
        }
      ]
    };
    const createChatThreadResult = await chatClient.createChatThread(
      createChatThreadRequest,
      createChatThreadOptions
    );
    const threadId = createChatThreadResult.chatThread.id;
    return threadId;
  }

  const getThread = async () => {
    let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
    let chatThreadClient = chatClient.getChatThreadClient("19:_yIdN2iFw0CnZJphsahZ2me6uVG_lHaLwifLkKzPRTY1@thread.v2");
    console.log('Threads:', chatThreadClient);
    const messages = chatThreadClient.listMessages();
    console.log('Messages:', messages);
    for await (const message of messages) {
      // print message content
      console.log(message.senderDisplayName, message.content, message.createdOn);

    }
  }

  useEffect(() => {
    (async () => {
      if (Device.osName !== "iOS") {
        getTokenFromExpo();
        let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
        // open notifications channel
        await chatClient.startRealtimeNotifications();
        // subscribe to new notification
        chatClient.on("chatMessageReceived", (e) => {
          console.log("Notification chatMessageReceived!");
          console.log(e.message);
          // your code here
        });
      }
    })()

  }, [])
  const sendMessage = async () => {
    let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
    let chatThreadClient = chatClient.getChatThreadClient("19:_yIdN2iFw0CnZJphsahZ2me6uVG_lHaLwifLkKzPRTY1@thread.v2");
    const sendMessageRequest =
    {
      content: 'Ciao è una prova'
    };
    let sendMessageOptions =
    {
      senderDisplayName: 'Jack',
      type: 'text',
    };
    const sendChatMessageResult = await chatThreadClient.sendMessage(sendMessageRequest, sendMessageOptions);
    const messageId = sendChatMessageResult.id;
    console.log(`Message sent!, message id:${messageId}`);

  }
  const startChat = async () => {
    createChatThread().then(async threadId => {
      console.log(`Thread created:${threadId}`);
      let chatThreadClient = chatClient.getChatThreadClient(threadId);

      // PLACEHOLDERS
      // <CREATE CHAT THREAD CLIENT>
      // <RECEIVE A CHAT MESSAGE FROM A CHAT THREAD>
      // <SEND MESSAGE TO A CHAT THREAD>
      // <LIST MESSAGES IN A CHAT THREAD>
      // <ADD NEW PARTICIPANT TO THREAD>
      // <LIST PARTICIPANTS IN A THREAD>
      // <REMOVE PARTICIPANT FROM THREAD>
    });
  }
  return (
    <View style={styles.container}>
      {
        Device.osName === "iOS" ?
          <>
            <Text>Open up App.js to start working on your app!</Text>
            <StatusBar style="auto" />
            <Button
              title="Invia messaggio"
              onPress={sendMessage}
            />
          </>
          :
          <>
            <StatusBar style="auto" />
            <Button
              title="Ottieni chat"
              onPress={getThread}
            />
          </>
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
