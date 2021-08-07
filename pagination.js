import React, { useState, useEffect, useRef } from "react";
import ReactTable from "react-table-6";

import "react-table-6/react-table.css";
import "./reactTable.css";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { userdataQuery } from "./ReactTableQuery";
import fetchMethod from "../../apiCalls/PostApiGQL";
import swal from "sweetalert";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      width: "25ch",
      height: "30px",
    },
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const ReactTableComp = ({ data, columns, fetchList, dataCount, Component }) => {
  const classes = useStyles();
  let selectInpt1 = useRef(null);
  let selectInpt2 = useRef(null);
  const [datas, setDatas] = useState([]);
  const [getListData, setGetListData] = useState([]);
  const [getListData2, setGetListData2] = useState([]);
  const [paginate, setPaginate] = useState([0, 5]);
  const [rows, setRows] = useState("");
  const [rowsInfo, setRowsInfo] = useState("");
  const [Transacfilter, setTransacfilter] = useState([]);
  const [TransacId, setTransacId] = useState(1);

  let getData = (e) => {
    if (parseInt(e) > data.length) {
      setDatas(data.slice(0, parseInt(e - 1)));
    } else {
      setDatas(data.slice(0, parseInt(e)));
    }
  };

  const getListByRows = (rowInfo, rows, count) => {
    let CheckRows = dataCount ? dataCount / rows : 0;

    if (dataCount && !!(CheckRows % 1)) {
      let arr = [];
      for (let i = rowInfo; i <= parseInt(CheckRows) + count; i++) {
        arr.push(i);
      }
      if (data.length > 0) {
        setGetListData(arr);
        setRowsInfo(rowInfo);
      }
    } else {
      if (data) {
        let arr = [];
        for (let i = rowInfo; i <= CheckRows; i++) {
          arr.push(i);
        }
        if (data.length > 0) {
          setGetListData(arr);
          setRowsInfo(rowInfo);
        }
      }
    }
  };

  const getList = () => {
    if (rows == 10 && dataCount) {
      getListByRows(1, 10, 1);
    }

    if (rows == 20) {
      getListByRows(1, 20, 1);
    }
    if (rows == 30) {
      getListByRows(1, 30, 1);
    }
  };

  useEffect(() => {
    getList();
  }, [fetchList]);

  useEffect(() => {
    let Rowdata = !rows ? 10 : rows;
    setDatas(data.slice(0, Rowdata));
    setRows(Rowdata);
    setPaginate([0, 5]);
    getList();
  }, [rows]);

  const getFilteredData = (i) => {
    if (localStorage.getItem("finder") && Component === "Transaction") {
      fetchList("searcByList", rows, rows * i);
      setDatas(data);
    }

    if (
      fetchList &&
      !localStorage.getItem("finder") &&
      Component == "Transaction"
    ) {
      fetchList("searchByRow", rows, rows * i);
      setDatas(data);
    }

    if (Component == "Users") {
      fetchList("searchByRow", rows, rows * i);
      setDatas(data);
    }
  };

  const getDataByRow = (i) => {
    fetchList("part", "", i);
  };

  useEffect(() => {
    getFilteredData();
  }, [data]);

  const inc = () => {
    setPaginate(() => {
      if (getListData.slice(paginate[0], paginate[1]).length == 5) {
        return [paginate[0] + 1, paginate[1] + 1];
      } else {
        return paginate;
      }
    });
    selectInpt2.current.style.fontWeight = "bold";
    selectInpt1.current.style.fontWeight = null;
    selectInpt2.current.style.color = "#ff6666";
    selectInpt1.current.style.color = null;
  };

  const dec = () => {
    setPaginate(() => {
      if (paginate[0] == 0 && paginate[1] == 5) {
        return [0, 5];
      } else {
        return [paginate[0] - 1, paginate[1] - 1];
      }
    });
    selectInpt1.current.style.fontWeight = "bold";

    selectInpt2.current.style.fontWeight = null;
    selectInpt1.current.style.color = "#ff6666";
    selectInpt2.current.style.color = null;
  };

  const handleSearch = (e) => {
    let filteredata = data.filter((item) => {
      if (
        item &&
        item.CustomerName &&
        item.CustomerName.toLowerCase().includes(e) == true
      ) {
        return item;
      }

      if (
        item &&
        item.merchantName &&
        item.merchantName.toLowerCase().includes(e) == true
      ) {
        return item;
      }
    });
    setDatas(filteredata);
  };

  useEffect(() => {
    if (Component == "Transaction") {
      fetchMethod(userdataQuery, {
        where: { active: 1 },
      })
        .then((res) => res.json())
        .then((res) => {
          if (
            res &&
            res.data &&
            res.data.allUserdata &&
            res.data.allUserdata.Userdata
          ) {
            setTransacfilter(res.data.allUserdata.Userdata);
          }
        })
        .catch((e) => {
          swal({ title: e.message, icon: "warning" });
        });
    }
  }, []);

  const handleTransacSelect = (e) => {
    if (Component == "Transaction") {
      fetchList("searchTransaction", e, rows);
      localStorage.setItem("finder", e);
    }

    if (Component == "Users") {
      fetchList("searchUser", e, rows);
    }
  };

  return (
    <div className="React-Table-Main">
      <div className="React-Table-Container">
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Rows</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={!rows ? 10 : rows}
            onChange={(e) => {
              getData(e.target.value);
              setRows(e.target.value);
              getDataByRow(e.target.value);
            }}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
        {Component == "Users" && (
          <TextField
            id="standard-basic"
            label="Search"
            onChange={(e) => {
              handleTransacSelect(e.target.value);
            }}
          />
        )}
        {Component == "Transaction" && (
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">
              Payment Made By
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              onChange={(e) => handleTransacSelect(e.target.value)}
            >
              {Transacfilter.length > 0 &&
                Transacfilter.map((item) => {
                  return (
                    <MenuItem
                      value={item.id}
                    >{`${item.firstname} ${item.lastname}`}</MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        )}
      </div>
      <div className="React-Table-Primary">
        <div className="React-Table-SecondaryTable">
          <div>
            <ReactTable
              className="-striped"
              manual
              defaultPageSize={5}
              showPagination={false}
              data={datas}
              columns={columns}
              pages={0}
              minWidth={400}
            />
          </div>
        </div>
        {getListData.length > 0 && (
          <div className="React-Table-Pagination">
            <div>
              <button
                className="React-Table-Pagination-prev"
                ref={selectInpt1}
                onClick={() => {
                  dec();
                }}
              >
                {"<"}
              </button>
            </div>
            <div className="React-table-pge-no">
              {getListData.length > 0 &&
                rows == 10 &&
                getListData.slice(paginate[0], paginate[1]).map((item, i) => {
                  return (
                    <a
                      className="React-Table-PagNum"
                      key={i}
                      onClick={() => {
                        getFilteredData(item);
                      }}
                    >
                      {parseInt((i = item + 0.5))}
                    </a>
                  );
                })}

              {rows == 20 &&
                getListData.slice(paginate[0], paginate[1]).map((item, i) => {
                  return (
                    <a
                      className="React-Table-PagNum"
                      key={i}
                      onClick={() => {
                        getFilteredData(item);
                      }}
                    >
                      {parseInt((i = item + 0.5))}
                    </a>
                  );
                })}

              {rows == 30 &&
                getListData.slice(paginate[0], paginate[1]).map((item, i) => {
                  return (
                    <a
                      className="React-Table-PagNum"
                      key={i}
                      onClick={() => {
                        getFilteredData(item);
                      }}
                    >
                      {parseInt((i = item + 0.5))}
                    </a>
                  );
                })}
            </div>
            <div>
              <button
                className="React-Table-Pagination-next"
                ref={selectInpt2}
                onClick={() => inc()}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactTableComp;
