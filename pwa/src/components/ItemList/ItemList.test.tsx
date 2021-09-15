import {
  ItemList,
  ItemListProps,
  FilterType,
  SorterType,
  ItemProps,
} from "../";
import { deepElement } from "../../scripts/functions";
import { shallow, mount, ShallowWrapper } from "enzyme";

const data: ItemListProps = {
  list: [
    {
      url: "https://medium.com/@gilfink/adding-web-interception-abilities-to-your-chrome-extension-fb42366df425",
      logo: {
        src: "https://www.medium.com/favicon.ico",
      },
      words: {
        title: "Adding Web Interception Abilities to Your Chrome Extension",
        author: "Gil Fink",
        date: "2018-01-30",
        length: "00:05:00",
      },
    },
    {
      url: "https://www.youtube.com/watch?v=DH7QVll30XQ&list=PLC3y8-rFHvwg2-q6Kvw3Tl_4xhxtIaNlY&index=23&t=152s",
      logo: {
        src: "https://www.youtube.com/favicon.ico",
      },
      words: {
        title: "Chrome Extension Tutorial - 23 - Context Menu Functionality",
        author: "Codevolution",
        date: "2016-09-18",
        length: "00:05:27",
      },
    },
    {
      url: "https://en.wikipedia.org/wiki/Project_Veritas",
      logo: {
        src: "https://www.wikipedia.com/favicon.ico",
      },
      words: {
        title: "Project Veritas",
        author: "unknown",
        date: "2020-11-20",
        length: "00:40:00",
      },
    },
    {
      url: "https://material-ui.com/components/selects/#select",
      logo: {
        src: "https://www.material-ui.com/favicon.ico",
      },
      words: {
        title: "Select",
        author: "unknown",
        date: "today",
        length: "00:05:00",
      },
    },
    {
      url: "https://css-tricks.com/almanac/properties/g/gap/",
      logo: {
        src: "https://www.css-tricks.com/favicon.ico",
      },
      words: {
        title: "gap",
        author: "Mojtaba Seyedi",
        date: "2020-08-13",
        length: "00:15:00",
      },
    },
  ],
  filters: [
    {
      name: "url",
      values: ["youtube", "wikipedia"],
    },
    {
      name: "words.title",
      keywords: ["Chrome Extension"],
    },
    {
      name: "words.author",
      values: ["unknown"],
    },
    {
      name: "words.date",
      range: ["-", "2020-08-13"],
    },
    {
      name: "words.length",
      range: ["00:05:01", "-"],
    },
  ],
  sort: [
    {
      name: "url",
      direction: "desc",
    },
    {
      name: "words.title",
      direction: "asc",
    },
    {
      name: "words.author",
      direction: "desc",
    },
    {
      name: "words.date",
      direction: "desc",
    },
    {
      name: "words.length",
      direction: "asc",
    },
  ],
};

describe("ItemList Basic Rendering", () => {
  let wrapper: ShallowWrapper;

  it("renders default successfully", () => {
    wrapper = shallow(<ItemList />);
    expect(wrapper.exists("[data-test-id='ItemList']")).toBeTruthy();
    expect(wrapper.children().length).toEqual(0);
  });

  it("renders full list successfully", () => {
    wrapper = shallow(<ItemList list={data.list} />);
    expect(wrapper.children().length).toEqual(
      (data.list as ItemProps[]).length
    );
    const urls = wrapper.find("Item").map((node) => node.prop("url"));
    const urlsData = (data.list as ItemProps[]).map(
      (item) => item.url as string
    );
    expect(urls).toEqual(urlsData);
  });

  test.todo("renders each filter correctly", () => {
    wrapper = shallow(<ItemList list={data.list} filters={data.filters} />);
  });

  test.todo("renders ranked sorting fully", () => {
    wrapper = shallow(<ItemList list={data.list} sort={data.sort} />);
  });

  test.todo("renders filtered and rank sorting together", () => {
    wrapper = shallow(<ItemList {...data} />);
  });
});

/**
 * Returns a list of filters for unit and combined testing
 *
 * @param idxs - Array of indexes for requested filters in `data.filters`
 * @returns Array of filters specified by `idxs` in `data.filters`
 */
const getFilters = (idxs: number[]): FilterType[] =>
  (data.filters as FilterType[]).filter(
    (f, i) => f != undefined && idxs.includes(i)
  );

/**
 * Returns a list of sorters for unit and combined testing
 *
 * @param idxs - Array of indexes for requested sorters in `data.sort`
 * @returns Array of sorters specified by `idxs` in `data.sort`
 */
const getSorters = (idxs: number[]): SorterType[] =>
  (data.sort as SorterType[]).filter(
    (f, i) => f != undefined && idxs.includes(i)
  );

/**
 * Returns specified item values for unit and combined testing
 *
 * @param idxs - Array of item indices to retrieve items for assertion
 * @param property - The specific property to be used for assertion (`url`)
 * @returns the `property` value for each item specified in `idxs`
 */
const getItemsProperties = (idxs: number[], property: string): string[] =>
  (data.list as ItemProps[]).flatMap((item, i) =>
    idxs.includes(i) ? [deepElement(property, item)] : []
  );

/**
 * Helper function defining filtering and sorting testing framework
 *
 * @param filterIdxs - Indices of filters used in test
 * @param sorterIdxs - Indices of sorters used in test
 * @param itemIdxs - Indices of items for test assertion
 */
const testFiltersAndSorters = ({
  filterIdxs = [],
  sorterIdxs = [],
  itemIdxs,
}: {
  [key: string]: number[];
}): void => {
  const wrapper = mount(
    <ItemList
      list={data.list}
      filters={getFilters(filterIdxs)}
      sort={getSorters(sorterIdxs)}
    />
  );
  wrapper.length;
  const urlsData = getItemsProperties(itemIdxs, "url");
  expect(wrapper.children().length).toEqual(urlsData.length);
  const urls = wrapper.find("Item").map((node) => node.prop("url"));
  expect(urls).toEqual(urlsData);
};

describe("ItemList Filtering", () => {
  it("filters by URL/service", () => {
    testFiltersAndSorters({
      filterIdxs: [0],
      itemIdxs: [1, 2],
    });
  });

  it("filters by item title", () => {
    testFiltersAndSorters({
      filterIdxs: [1],
      itemIdxs: [0, 1],
    });
  });

  it("filters by item author", () => {
    testFiltersAndSorters({
      filterIdxs: [2],
      itemIdxs: [2, 3],
    });
  });

  it("filters by item date", () => {
    testFiltersAndSorters({
      filterIdxs: [3],
      itemIdxs: [0, 1, 4],
    });
  });

  it("filters by item length", () => {
    testFiltersAndSorters({
      filterIdxs: [4],
      itemIdxs: [1, 2, 4],
    });
  });

  it("supports two filters", () => {
    testFiltersAndSorters({
      filterIdxs: [0, 1],
      itemIdxs: [1],
    });
    testFiltersAndSorters({
      filterIdxs: [1, 3],
      itemIdxs: [0, 1],
    });
    testFiltersAndSorters({
      filterIdxs: [3, 4],
      itemIdxs: [1, 4],
    });
    testFiltersAndSorters({
      filterIdxs: [2, 4],
      itemIdxs: [2],
    });
    testFiltersAndSorters({
      filterIdxs: [0, 2],
      itemIdxs: [2],
    });
  });

  it("supports all filters", () => {
    testFiltersAndSorters({
      filterIdxs: [0, 1, 2, 3, 4],
      itemIdxs: [],
    });
  });
});

describe("ItemList Sorting", () => {
  it("sorts by URL/service", () => {
    testFiltersAndSorters({
      sorterIdxs: [0],
      itemIdxs: [1, 2, 0, 3, 4],
    });
  });

  it("sorts by item title", () => {
    testFiltersAndSorters({
      sorterIdxs: [1],
      itemIdxs: [0, 1, 4, 2, 3],
    });
  });

  it("sorts by item author", () => {
    testFiltersAndSorters({
      sorterIdxs: [2],
      itemIdxs: [3, 2, 4, 0, 1],
    });
  });

  it("sorts by item date", () => {
    testFiltersAndSorters({
      sorterIdxs: [3],
      itemIdxs: [1, 0, 4, 2, 3],
    });
  });

  it("sorts by item length", () => {
    testFiltersAndSorters({
      sorterIdxs: [4],
      itemIdxs: [2, 4, 1, 3, 0],
    });
  });
});

describe("ItemList Filtering & Sorting", () => {
  it("filters and sorts by URL/service", () => {
    testFiltersAndSorters({
      filterIdxs: [0],
      sorterIdxs: [0],
      itemIdxs: [1, 2],
    });
  });

  it("filters and sorts by item title", () => {
    testFiltersAndSorters({
      filterIdxs: [1],
      sorterIdxs: [1],
      itemIdxs: [0, 1],
    });
  });

  it("filters and sorts by item author", () => {
    testFiltersAndSorters({
      filterIdxs: [2],
      sorterIdxs: [2],
      itemIdxs: [2, 3],
    });
  });

  it("filters and sorts by date", () => {
    testFiltersAndSorters({
      filterIdxs: [3],
      sorterIdxs: [3],
      itemIdxs: [4, 0, 1],
    });
  });

  it("filters and sorts by length", () => {
    testFiltersAndSorters({
      filterIdxs: [4],
      sorterIdxs: [4],
      itemIdxs: [1, 4, 2],
    });
  });
});
