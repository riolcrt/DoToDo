import { State } from '@ngxs/store';
​
@State<string[]>({
    name: 'todos',
    defaults: []
})
export class TodosState {}
