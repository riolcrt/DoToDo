import { TagTypeEnum } from '../shared/TodosModel';

export const TODOITEM_SHORTCUTS = [{
    altKey: true,
    key: 'd',
    tagType: TagTypeEnum.Done
  } ,
  {
    altKey: true,
    key: 's',
    tagType: TagTypeEnum.Started
  },
  {
    altKey: true,
    key: 'c',
    tagType: TagTypeEnum.Cancelled
  },
];
