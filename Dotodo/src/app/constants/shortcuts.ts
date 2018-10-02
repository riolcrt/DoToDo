import { TagTypeEnum } from '../shared/TodosModel';

export const TODOITEM_SHORTCUTS = [{
    altKey: true,
    key: 'd',
    action: TagTypeEnum.Done
  } ,
  {
    altKey: true,
    key: 's',
    action: TagTypeEnum.Started
  },
  {
    altKey: true,
    key: 'c',
    action: TagTypeEnum.Cancelled
  }
];
