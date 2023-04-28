/// <reference types="@ice/pkg/types" />

export interface IDataItem {
  value: any;
  children?: IDataItem[];
  [key: string]: any;
}

export type IDataSource = IDataItem[];
