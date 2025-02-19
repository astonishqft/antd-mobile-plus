import React, { FC, useImperativeHandle, forwardRef } from 'react';
import SwipeAction from 'antd-mobile/lib/swipe-action';
import { withError, useTracker } from '@alitajs/tracker';
import classnames from 'classnames';
import { useSetState } from 'ahooks';
import useCompleteLocale from '../LocaleProvider/useCompleteLocale';
import { getTypeWithFileName } from './utils';
import {
  UploadEditType,
  UploadFileDataType,
  UploadFileDisabelType,
  UploadFileType,
} from './PropsType';
import './index.less';

const prefixCls = 'alita-upload-file';

type UploadType<T> = T extends true
  ? UploadFileDisabelType
  : T extends false
  ? UploadEditType
  : never;

const UploadFile: FC<UploadType<UploadFileType['disable']>> = (props) => {
  const {
    initialData = [],
    onDelete,
    onPreview,
    onClick,
    disable = false,
    accept = '*/*',
    multiple = true,
    title,
    onRenderTips,
    forwardRef,
  } = props as any;
  const [state, setState] = useSetState<{
    data: UploadFileDataType[];
  }>({
    data: initialData,
  });
  const lang = useCompleteLocale();
  const log = useTracker(UploadFile.displayName, {});
  useImperativeHandle(forwardRef, () => {
    return {
      data: () => {
        return state.data;
      },
    };
  });

  const onDeletePress = (file: UploadFileDataType, index: number) => {
    const { data } = state;
    data.splice(index, 1);
    setState({
      data: [...data],
    });
    onDelete && onDelete(index, file);
  };

  const rightAction = (file: UploadFileDataType, index: number) => {
    return [
      {
        text: '删除',
        className: `${prefixCls}-action-delete`,
        onPress: () => {
          log('onDeletePress');
          onDeletePress(file, index);
        },
      },
      {
        text: '预览',
        className: `${prefixCls}-action-preview`,
        onPress: () => {
          log('onPreview');
          onPreview && onPreview(index, file);
        },
      },
    ];
  };

  const addFileToData = (e: any) => {
    const files: File[] = Array.from(e.target.files);
    const data = files.map(
      (item: File): UploadFileDataType => {
        return {
          type: getTypeWithFileName(item),
          name: item.name,
          id: `${item.lastModified}`,
          file: item,
        };
      },
    );
    setState({
      data: state.data.concat(data),
    });
  };

  const UploadLoadButton = () => {
    return disable ? (
      <></>
    ) : (
      <div className={`${prefixCls}-extra`}>
        <input
          id={'id'}
          type="file"
          accept={accept}
          onChange={addFileToData}
          multiple={multiple}
        />
      </div>
    );
  };

  const FileItem = ({
    item,
    index,
  }: {
    item: UploadFileDataType;
    index: number;
  }) => {
    return (
      <SwipeAction
        autoClose
        disabled={disable}
        right={rightAction(item, index)}
      >
        <div className={`${prefixCls}-fileitem`} onClick={onClick}>
          <i
            className={classnames(`${prefixCls}-icon`, {
              [`${prefixCls}-icon-docx`]: item.type === 'doc',
              [`${prefixCls}-icon-xlsx`]: item.type === 'excel',
              [`${prefixCls}-icon-img`]: item.type === 'image',
              [`${prefixCls}-icon-ppt`]: item.type === 'ppt',
              [`${prefixCls}-icon-pdf`]: item.type === 'pdf',
              [`${prefixCls}-icon-other`]: item.type === 'other',
            })}
          ></i>
          <div className={`${prefixCls}-text`}>
            <div>{item.name}</div>
            {onRenderTips ? onRenderTips(item) : <></>}
          </div>
        </div>
      </SwipeAction>
    );
  };

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-card`}>
        <div className={`${prefixCls}-header`}>
          <div className={`${prefixCls}-title`}>
            {title ?? lang.UploadFile.title}
          </div>
          <UploadLoadButton />
        </div>
        <div hidden={state.data.length === 0} className={`${prefixCls}-body`}>
          {state.data.map((item, index) => {
            return <FileItem key={`${item.id}`} item={item} index={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

UploadFile.displayName = 'UploadFile';
export default withError(UploadFile, {
  forwardRef: true,
});
