import React from 'react';
import {WebView} from 'react-native-webview';

type SvgUriProps = {
  uri: string;
  height: number;
  width: number;
};

const SvgUri = (props: SvgUriProps) => {
  const {uri, height, width} = props;
  const html = `
  <div>
   <img width="100%" height="100%"src="${uri}"/>
  </div>
  `;
  return (
    <WebView
      source={{html: html}}
      javaScriptEnabled={true}
      style={{height, width}}
    />
  );
};

export default SvgUri;