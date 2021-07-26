import { h, diff, patch, create } from 'virtual-dom';
import classNames from 'classnames';

export function init(view) {
  const mountNode = view || document;

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const filterOption = mountNode.querySelector('.filter-options');
  const groceryListRoot = mountNode.querySelector('#grocery-list-root');

  addButton.addEventListener('click', addItemHandler);
  filterOption.addEventListener('change', selectFilterHandle);
  document.addEventListener('DOMContentLoaded', initHandler);

  const getInitialState = () => ({
    groceryList: [],
    activeFilter: 'all',
  });

  const store = createStore(reducer, getInitialState());

  let currentView;
  let rootNode;

  function initHandler() {
    currentView = renderGroceryList();
    rootNode = create(currentView);

    groceryListRoot.innerHTML = '';
    groceryListRoot.appendChild(rootNode);

    store.dispatch({
      type: 'ADD_ITEM',
      payload: {
        text: 'Mleko',
      },
    });
  }

  store.subscribe(() => {
    const updatedView = renderGroceryList();
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  });

  function addItemHandler(e) {
    e.preventDefault();
    store.dispatch({
      type: 'ADD_ITEM',
      payload: {
        text: addInput.value,
      },
    });
    addInput.value = '';
  }

  function selectFilterHandle(e) {
    store.dispatch({
      type: 'FILTER_CHANGED',
      payload: {
        filter: e.target.value,
      },
    });
  }

  function renderGroceryList() {
    const data = store.getState();
    const list = filter(data.groceryList, data.activeFilter).map(
      getItemNodeFrom
    );
    return h(
      'ul',
      {
        className: 'grocery-list',
      },
      list
    );
  }

  function filter(list, filter) {
    if (filter === 'all') {
      return list;
    }
    return list.filter((i) => {
      return filter === 'completed' ? i.completed : !i.completed;
    });
  }

  function getItemNodeFrom(item) {
    return h(
      'li',
      {
        className: classNames('grocery-list-item', {
          completed: item.completed,
        }),
      },
      [
        h(
          'span',
          {
            className: 'grocery-list-item-text',
          },
          item.text
        ),
        h(
          'button',
          {
            className: 'complete-btn',
            onclick: () =>
              store.dispatch({
                type: 'COMPLETE_ITEM',
                payload: {
                  id: item.id,
                },
              }),
          },
          h('i', {
            className: 'fas fa-check',
          })
        ),
        h(
          'button',
          {
            className: 'delete-btn',
            onclick: () =>
              store.dispatch({
                type: 'DELETE_ITEM',
                payload: {
                  id: item.id,
                },
              }),
          },
          h('i', {
            className: 'fas fa-trash',
          })
        ),
      ]
    );
  }
}

const createStore = (reducer, initialState) => {
  const store = {};
  store.state = initialState;
  store.listeners = [];

  store.getState = () => store.state;

  store.subscribe = (listener) => {
    store.listeners.push(listener);
  };

  store.dispatch = (action) => {
    console.log('ACTION:', action);
    console.log('BEFORE:', store.state);
    store.state = reducer(store.state, action);
    console.log('AFTER:', store.state);

    store.listeners.forEach((listener) => listener());
  };

  return store;
};

const reducer = (prevState = getInitialState(), action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const id = Date.now();
      const completed = false;
      const nextState = {
        ...prevState,
        groceryList: [
          ...prevState.groceryList,
          { id, text: action.payload.text, completed },
        ],
      };

      return nextState;
    }
    case 'DELETE_ITEM': {
      const groceryList = prevState.groceryList.filter((i) => {
        return i.id !== action.payload.id;
      });
      const nextState = { ...prevState, groceryList };

      return nextState;
    }
    case 'COMPLETE_ITEM': {
      const groceryList = prevState.groceryList.map((i) => {
        if (i.id === action.payload.id) {
          return { ...i, completed: !i.completed };
        }
        return i;
      });
      const nextState = { ...prevState, groceryList };

      return nextState;
    }
    case 'FILTER_CHANGED': {
      const nextState = {
        ...prevState,
        activeFilter: action.payload.filter,
      };

      return nextState;
    }
    default:
      return prevState;
  }
};
