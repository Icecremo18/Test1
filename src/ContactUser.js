import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
const columns = [
    {
        name: 'ID',
        selector: row => row.id,
        sortable: true,
        width: '100px'
    },
    {
        name: 'First Name',
        selector: row => row.fname,
        sortable: true,
        width: '200px'
    },
    {
        name: 'Last Name',
        selector: row => row.lname,
        sortable: true,
        width: '200px'
    },
    {
        name: 'Username',
        selector: row => row.username,
        sortable: true,
        width: '200px'
    },
    {
        name: 'Email Address',
        selector: row => row.email_address,
        sortable: true,
        width: '200px'
    },
    {
        name: 'Phone',
        selector: row => row.phone,
        sortable: true,
        width: '100px',
        //ล่างนี้ใส่รูปภาพได้ภายในแถว
        // cell: row => <img src={row.coverimage} width={100} alt={row.name}></img>
    },
];

function ContactUser() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
    const [sortColumn, setSortColumm] = useState('');
    const [sortColumnDir, setSortColummDir] = useState('');
    const [search, setSearch] = useState('');

	const fetchData = async () => {
		setLoading(true);

        var url = `http://localhost:3333/api/users?page=${page}&per_page=${perPage}`;
        if (search) {
            url += `&search=${search}`;
        }
        if (sortColumn) {
            url += `&sort_column=${sortColumn}&sort_direction=${sortColumnDir}`;
        }
		const response = await axios.get(`http://localhost:3333/api/users?page=${page}&per_page=${perPage}`);

		setData(response.data.data);
		setTotalRows(response.data.total);
		setLoading(false);
	};

	const handlePageChange = page => {
		setPage(page);
	};

	const handlePerRowsChange = async (newPerPage, page) => {
		setPerPage(newPerPage);
	};

    const handleSort = (column, sortDirection) => {
        setSortColumm(column.name);
        setSortColummDir(sortDirection);
	};

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        fetchData();
    }

	useEffect(() => {
		fetchData();
	}, [page, perPage, sortColumn, sortColumnDir]);

	return (
        <div>
            <form onSubmit={handleSearchSubmit}>
                <label>
                Search :
                <input type="text" name="search" onChange={handleSearchChange}/>
                </label>
                <input type="submit" value="Submit" />
            </form>
            <DataTable
                title="Contact Users"
                columns={columns}
                data={data}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                onSort={handleSort}
            />
        </div>
	);
  }
  
  export default ContactUser;