export function init(view) {
  const mountNode = view || document;

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const groceryList = mountNode.querySelector('.grocery-list');
  const filterOption = mountNode.querySelector('.filter-options');

  addButton.addEventListener('click', addItemHandler);
  document.addEventListener('DOMContentLoaded', initHandler);
  filterOption.addEventListener('change', selectFilterHandle);

  const getInitialState = () => ({
    groceryList: [],
    activeFilter: 'all',
  });

  const store = createStore(reducer, getInitialState());

  function initHandler() {
    renderGroceryList();
    store.dispatch({
      type: 'ADD_ITEM',
      payload: {
        text: 'Mleko',
      },
    });
  }

  store.subscribe(() => {
    renderGroceryList();
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
    groceryList.innerHTML = '';
    filter(data.groceryList, data.activeFilter).forEach(function (item) {
      const newItem = getItemNodeFrom(item);

      groceryList.appendChild(newItem);
    });
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
    const newItem = document.createElement('li');
    newItem.classList.add('grocery-list-item');
    if (item.completed) {
      newItem.classList.add('completed');
    }
    const text = document.createElement('span');
    text.textContent = item.text;

    text.classList.add('grocery-list-item-text');
    newItem.appendChild(text);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = `<i class="fas fa-check"></i>`;
    completedButton.classList.add('complete-btn');
    completedButton.addEventListener('click', () =>
      store.dispatch({
        type: 'COMPLETE_ITEM',
        payload: {
          id: item.id,
        },
      })
    );
    newItem.appendChild(completedButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () =>
      store.dispatch({
        type: 'DELETE_ITEM',
        payload: {
          id: item.id,
        },
      })
    );
    newItem.appendChild(deleteButton);
    return newItem;
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
