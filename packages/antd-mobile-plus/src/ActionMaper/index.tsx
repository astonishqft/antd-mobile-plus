import React, { FC, useRef, useState, useEffect } from 'react';
import Map, { MapApiLoaderHOC } from 'react-bmapgl/Map';
import Marker from 'react-bmapgl/Overlay/Marker';
import { withError } from '@alitajs/tracker';
import { ActionMaperType, ActionMaperCoordinateType } from './PropsType';
import MapHeader from './components/MapHeader';
import RightExt from './components/RightExt';
import ZoomControl, { ZoomType } from './components/ZoomControl';
import './index.less';

const prefixCls = 'alita-action-maper';
export interface FCMap<T = {}> extends FC<T> {
  MapApiLoaderHOC: ({ ak }: { ak: string }) => (a: any) => FC;
}

const ActionMaper: FCMap<ActionMaperType> = (props) => {
  const {
    title = '',
    detailAddress = '',
    coordinate,
    onLocation = () => {},
    initialzeZoom = 12,
    rightExt,
  } = props;
  const mapRef = useRef(null);
  const [mapScale, setMapScale] = useState(1);
  const [address, setAddress] = useState(detailAddress);
  const [zoom, setZoom] = useState(initialzeZoom);
  const [
    currentPosition,
    setCurrentPosition,
  ] = useState<ActionMaperCoordinateType>(() => {
    if (!coordinate) {
      return {
        // 默认展示北京天安门位置，否则会显示一片海洋
        lat: 39.914889,
        lng: 116.404449,
      };
    }
    return coordinate;
  });

  const onZoom = (type: ZoomType) => {
    if (type === 'plus') {
      if (zoom < 19) {
        setZoom(zoom + 1);
      }
    } else if (type === 'minus') {
      if (zoom > 3) {
        setZoom(zoom - 1);
      }
    }
  };

  const initialMapScale = () => {
    const ONE_REM =
      parseInt(document.documentElement.style.fontSize || '100', 10) || 100;
    const scale = ONE_REM / 100 < 1 ? 1 : ONE_REM / 100;
    setMapScale(scale * 1.5);
  };

  const startGeolocation = () => {
    if (coordinate) {
      return;
    }
    const BMapGL = (window as any).BMapGL;
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition((result: any) => {
      if (result && result.point) {
        const {
          point: { lat, lng },
          address = {},
        } = result;
        const {
          province = '',
          city = '',
          district = '',
          street = '',
        } = address;
        onLocation({ lat: lat, lng: lng });
        setCurrentPosition({ lat: lat, lng: lng });
        setAddress(`${province}${city}${district}${street}`);
      }
    });
  };

  useEffect(() => {
    initialMapScale();
    startGeolocation();
    return () => {};
  }, []);

  return (
    <div className={prefixCls}>
      <MapHeader
        title={title}
        rightExt={
          rightExt ||
          (() => (
            <RightExt
              onClick={() => {
                if (mapRef.current) {
                  (mapRef.current as any).map.setCenter(currentPosition);
                }
              }}
            />
          ))
        }
      />
      <div className={`${prefixCls}-sub-title`}>{address}</div>
      <div className={`${prefixCls}-map-wrapper`}>
        <Map
          ref={mapRef}
          className={`${prefixCls}-map`}
          style={{ transform: `scale(${mapScale},${mapScale})` }}
          center={new (window as any).BMapGL.Point(currentPosition)}
          zoom={zoom}
        >
          <Marker
            position={{
              lng: currentPosition.lng,
              lat: currentPosition.lat,
            }}
            map={mapRef}
            icon="loc_red"
            autoViewport
          />
        </Map>
        <ZoomControl onZoom={onZoom} />
      </div>
    </div>
  );
};

ActionMaper.displayName = 'ActionMaper';

ActionMaper.MapApiLoaderHOC = MapApiLoaderHOC as any;
export default withError(ActionMaper);
