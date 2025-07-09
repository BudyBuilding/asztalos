import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllWorks, getAllCreatedTables, getWorkById } from "../../../data/getters";
import { fetchTables, fetchObjectsForWork, fetchCreatedItemsForWork, fetchCreatedTablesForWork, fetchCreatedTables } from "../../../data/storeManager";
import sorting from "../../helpers/sort";
import filtering from "../../helpers/filter";
import { IonIcon } from "@ionic/react";
import { filter, options } from "ionicons/icons";
import Button from "react-bootstrap/Button";

function CompanyDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [userList, setUserList] = useState([]);
  const [workList, setWorkList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);

  const [userSortConfig, setUserSortConfig] = useState({ key: null, direction: 1 });
  const [workSortConfig, setWorkSortConfig] = useState({ key: null, direction: 1 });
  const [tableSortConfig, setTableSortConfig] = useState({ key: null, direction: 1 });

  const [showSortUsers, setShowSortUsers] = useState(false);
  const [showSortWorks, setShowSortWorks] = useState(false);
  const [showSortTables, setShowSortTables] = useState(false);
  const [showFilterUsers, setShowFilterUsers] = useState(false);
  const [showFilterWorks, setShowFilterWorks] = useState(false);
  const [showFilterTables, setShowFilterTables] = useState(false);

  const [showUsers, setShowUsers] = useState(true);
  const [showWorks, setShowWorks] = useState(true);
  const [showTables, setShowTables] = useState(true);

  const [userFilterOptions, setUserFilterOptions] = useState([
    { label: "Name", vkey: "name", type: "string", value: "" },
    { label: "Email", vkey: "email", type: "string", value: "" },
    { label: "Sold", vkey: "sold", type: "interval", min: 0, max: 0 },
  ]);

  const [workFilterOptions, setWorkFilterOptions] = useState([
    { label: "Username", vkey: "username", type: "string", value: "" },
    { label: "Status", vkey: "status", type: "valueList", values: [], value: [] },
    { label: "Order Date", vkey: "orderDate", type: "interval", min: 0, max: 0 },
    { label: "Finish Date", vkey: "finishDate", type: "interval", min: 0, max: 0 },
  ]);

  const [tableFilterOptions, setTableFilterOptions] = useState([
    { label: "Color", vkey: "color", type: "string", value: "" },
    { label: "Price", vkey: "price", type: "interval", min: 0, max: 0 },
    { label: "Status", vkey: "status", type: "valueList", values: [], value: [] },
  ]);

  const userSortOptions = [
    { label: "ID", value: "userId" },
    { label: "Name", value: "name" },
    { label: "Sold", value: "sold" },
    { label: "Address", value: "address" },
    { label: "Email", value: "email" },
    { label: "Telephone", value: "telephone" },
  ];

  const workSortOptions = [
    { label: "ID", value: "workId" },
    { label: "User ID", value: "user.userId" },
    { label: "Username", value: "username" },
    { label: "Status", value: "status" },
    { label: "Order Date", value: "orderDate" },
    { label: "Finish Date", value: "finishDate" },
  ];

  const tableSortOptions = [
    { label: "Color", value: "color" },
    { label: "Work ID", value: "workId" },
    { label: "User ID", value: "userId" },
    { label: "Price", value: "price" },
    { label: "Status", value: "status" },
    { label: "Qty", value: "qty" },
    { label: "Price Per Qty", value: "pricePerQty" },
  ];
  const formatDate = (dateString) => {
    if (dateString) return new Date(dateString).toLocaleDateString("hu-HU");
    return "--";
  };


    const handleWorkClick = async (workId) => {
      setLoading(true);
      try {
        fetchTables(workId);
        fetchObjectsForWork(workId);
        fetchCreatedItemsForWork(workId);
//        fetchCreatedTablesForWork(workId);
        navigate(`/workAnalyzer/${workId}`);
        setLoading(false);
      } catch (error) {
        console.error("Error while selecting work:", error);
        setLoading(false);
      }
    };

useEffect(() => {
  async function init() {
    const loadedUsers = loadUsers();
    const loadedWorks = loadWorks();
    const filteredUsers = loadedUsers.filter(p => p.role === "user");     
    setUsers(filteredUsers);
    setWorks(loadedWorks);
    setUserList(filteredUsers);
    setWorkList(loadedWorks);

    const loadedTables = await loadTables(); // ✅ VÁRJUK MEG
    setTables(loadedTables);
    console.log("✅ Tables loaded (from useEffect):", loadedTables);

    const groupedTables = loadedTables.reduce((acc, table) => {
      if (
        !table ||
        !table.color ||
        !table.color.name ||
        !table.work ||
        !table.work.workId ||
        !table.work.user ||
        !table.work.user.userId ||
        table.price == null ||
        !table.work.status
      ) {
        console.warn("Érvénytelen tábla adat:", table);
        return acc;
      }

      const key = `${table.color.name}-${table.work.workId}`;
      if (!acc[key]) {
        acc[key] = {
          color: table.color.name,
          workId: table.work.workId,
          userId: table.work.user.userId,
          price: 0,
          status: table.work.companyStatus,
          qty: 0,
          pricePerQty: table.price,
        };
      }

      acc[key].price += table.price;
      acc[key].qty += 1;

      if (acc[key].pricePerQty !== table.price) {
        acc[key].pricePerQty = acc[key].price / acc[key].qty;
      }

      return acc;
    }, {});

    const groupedTableList = Object.values(groupedTables);
    setTableList(groupedTableList);
    setLoading(false);
  }

  init();
}, [render]);


  function loadUsers() {
    setLoading(false);
    const users = dispatch(getAllUsers());
    const filterdUsers = users;
    //const filterdUsers = users.filter(p => p.role == "user")
    return filterdUsers;
  }

  function loadWorks() {
    setLoading(false);
    const works = dispatch(getAllWorks());
    const filteredWorks = works.filter(p => p.isOrdered == true);
    return filteredWorks;
  }

async function loadTables() {
  const res = await dispatch(getAllCreatedTables());
  console.log("Tables loaded in loadTables:", res);
  return res; // ✅ nem csak setTables, hanem visszatérés is
}

  const sortUsers = (key) => {
    let direction = userSortConfig.direction === 1 ? 2 : 1;
    setUserSortConfig({ key, direction });
    const sorted = sorting(users, { key, direction });
    setUserList(sorted);
    setShowSortUsers(false);
  };

  const sortWorks = (key) => {
    let direction = workSortConfig.direction === 1 ? 2 : 1;
    setWorkSortConfig({ key, direction });
    const sorted = sorting(works, { key, direction });
    setWorkList(sorted);
    setShowSortWorks(false);
  };

  const sortTables = (key) => {
    let direction = tableSortConfig.direction === 1 ? 2 : 1;
    setTableSortConfig({ key, direction });
    const sorted = sorting(tableList, { key, direction });
    setTableList(sorted);
    setShowSortTables(false);
  };

  const startFilter = (itemType, key, type, actionType, value) => {
    if (itemType === "users") {
      let updatedConfig = userFilterOptions.map((config) => {
        if (config.vkey === key) {
          let newConfig = { ...config };
          if (type === "string") newConfig.value = value;
          if (type === "interval") {
            if (actionType === "min") newConfig.min = value;
            else newConfig.max = value;
          }
          return newConfig;
        }
        return config;
      });
      setUserFilterOptions(updatedConfig);
      setUserList(filtering(users, updatedConfig));
    } else if (itemType === "works") {
      let updatedConfig = workFilterOptions.map((config) => {
        if (config.vkey === key) {
          let newConfig = { ...config };
          if (type === "string") newConfig.value = value;
          if (type === "interval") {
            if (actionType === "min") newConfig.min = value;
            else newConfig.max = value;
          }
          if (type === "valueList") {
            if (newConfig.value.includes(value)) {
              newConfig.value = newConfig.value.filter((val) => val !== value);
            } else {
              newConfig.value = [...newConfig.value, value];
            }
          }
          return newConfig;
        }
        return config;
      });
      setWorkFilterOptions(updatedConfig);
      setWorkList(filtering(works, updatedConfig));
    } else if (itemType === "tables") {
      let updatedConfig = tableFilterOptions.map((config) => {
        if (config.vkey === key) {
          let newConfig = { ...config };
          if (type === "string") newConfig.value = value;
          if (type === "interval") {
            if (actionType === "min") newConfig.min = value;
            else newConfig.max = value;
          }
          if (type === "valueList") {
            if (newConfig.value.includes(value)) {
              newConfig.value = newConfig.value.filter((val) => val !== value);
            } else {
              newConfig.value = [...newConfig.value, value];
            }
          }
          return newConfig;
        }
        return config;
      });
      setTableFilterOptions(updatedConfig);
      setTableList(filtering(tableList, updatedConfig));
    }
  };

  const renderSortButton = (showSort, setShowSort, sortOptions, sortFunction) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="link"
        onClick={() => setShowSort(!showSort)}
        style={{ fontSize: "20px", textDecoration: "none" }}
      >
        <IonIcon icon={options} />
      </Button>
      {showSort && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "8px",
            zIndex: 1100,
            width: "200px",
            borderRadius: "2rem",
          }}
        >
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline-primary"
              className="w-100 mb-2"
              style={{ border: "none", color: "black", borderRadius: "3rem" }}
              onClick={() => sortFunction(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilterButton = (showFilter, setShowFilter, filterOptions, itemType) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button
        variant="link"
        onClick={() => setShowFilter(!showFilter)}
        style={{ fontSize: "20px", textDecoration: "none" }}
      >
        <IonIcon icon={filter} />
      </Button>
      {showFilter && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "8px",
            zIndex: 1100,
            width: "200px",
            borderRadius: "2rem",
          }}
        >
          {filterOptions.map((option) => {
            if (option.type === "string") {
              return (
                <input
                  key={option.vkey}
                  type="text"
                  placeholder={option.label}
                  onChange={(e) => startFilter(itemType, option.vkey, "string", "min", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "1rem",
                    border: "1px solid #ccc",
                    marginBottom: "8px",
                  }}
                />
              );
            }
            if (option.type === "interval") {
              const isDate = option.vkey.toLowerCase().includes("date");
              return (
                <div key={option.vkey} style={{ marginBottom: "12px" }}>
                  <div style={{ marginBottom: "6px", fontWeight: "bold" }}>{option.label}</div>
                  <input
                    type={isDate ? "date" : "number"}
                    value={option.min || ""}
                    onChange={(e) => startFilter(itemType, option.vkey, "interval", "min", e.target.value)}
                    style={{
                      width: "47.5%",
                      padding: "6px",
                      borderRadius: "1rem",
                      border: "1px solid #ccc",
                      marginRight: "5px",
                    }}
                  />
                  <input
                    type={isDate ? "date" : "number"}
                    value={option.max || ""}
                    onChange={(e) => startFilter(itemType, option.vkey, "interval", "max", e.target.value)}
                    style={{
                      width: "47.5%",
                      padding: "6px",
                      borderRadius: "1rem",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              );
            }
            if (option.type === "valueList") {
              return (
                <div key={option.vkey}>
                  <div style={{ marginBottom: "6px", fontWeight: "bold" }}>{option.label}</div>
                  {option.values.map((value) => (
                    <div key={value} style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={option.value.includes(value)}
                        onChange={() => startFilter(itemType, option.vkey, "valueList", "noaction", value)}
                      />
                      <span style={{ marginLeft: "5px" }}>{value}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <h1>Company Dashboard</h1>

      {/* Users táblázat */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Users</h2>
        <div>
          {renderSortButton(showSortUsers, setShowSortUsers, userSortOptions, sortUsers)}
          {renderFilterButton(showFilterUsers, setShowFilterUsers, userFilterOptions, "users")}
          <Button
            variant="link"
            onClick={() => setShowUsers(!showUsers)}
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showUsers ? "−" : "+"}
          </Button>
        </div>
      </div>
      {showUsers && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sold</th>
              <th>Address</th>
              <th>Email</th>
              <th>Telephone</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr key={user.userId}
                  onClick={() => navigate(`/userAnalyzer/${user.userId}`)}
                  style={{ cursor: "pointer" }}
              >
                <td>{user.userId}</td>
                <td>{user.name}</td>
                <td>{user.sold || 0}</td>
                <td>{user.address || "--"}</td>
                <td>{user.email || "--"}</td>
                <td>{user.telephone || "--"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Works táblázat */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Works</h2>
        <div>
          {renderSortButton(showSortWorks, setShowSortWorks, workSortOptions, sortWorks)}
          {renderFilterButton(showFilterWorks, setShowFilterWorks, workFilterOptions, "works")}
          <Button
            variant="link"
            onClick={() => setShowWorks(!showWorks)}
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showWorks ? "−" : "+"}
          </Button>
        </div>
      </div>
      {showWorks && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Finish Date</th>
            </tr>
          </thead>
          <tbody>
          {workList.map((work) => {
            const user = users.find((u) => String(u.userId) === String(work.user.userId));
            const userName = user?.username || "--";
            
            return (
              <tr
                key={work.workId}
                onClick={() => handleWorkClick(work.workId)}
                style={{ cursor: "pointer" }}
              >
                <td>{work.workId}</td>
                <td>{work.user.userId}</td>
                <td>{userName}</td>
                <td>{work.companyStatus || "--"}</td>
                <td>{formatDate(work.orderDate) || "--"}</td>
                <td>{formatDate(work.companyFinishDate) || "--"}</td>
              </tr>
            );
          })}

          </tbody>
        </Table>
      )}

      {/* Tables táblázat */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Tables</h2>
        <div>
          {renderSortButton(showSortTables, setShowSortTables, tableSortOptions, sortTables)}
          {renderFilterButton(showFilterTables, setShowFilterTables, tableFilterOptions, "tables")}
          <Button
            variant="link"
            onClick={() => setShowTables(!showTables)}
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showTables ? "−" : "+"}
          </Button>
        </div>
      </div>
      {showTables && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Color</th>
              <th>Work ID</th>
              <th>User ID</th>
              <th>Price</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Price Per Qty</th>
            </tr>
          </thead>
          <tbody>
            {tableList.map((group, index) => (
              <tr key={index}>
                <td>{group.color}</td>
                <td>{group.workId}</td>
                <td>{group.userId}</td>
                <td>{group.price}</td>
                <td>{group.status}</td>
                <td>{group.qty}</td>
                <td>{group.pricePerQty}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default CompanyDashboard;
