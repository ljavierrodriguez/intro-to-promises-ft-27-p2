import React, { useEffect, useReducer, useState } from 'react'
import { FaTrash, FaPencil } from 'react-icons/fa6'

const reducer = (state, action) => {
    switch (action.type) {
        case 'title':
            return { ...state, title: action.value }
        case 'priority':
            return { ...state, priority: action.value }
        case 'done':
            return { ...state, done: action.value }
        case 'id':
            return { ...state, id: action.value }
        default:
            return state
    }
}

const App = () => {
    const [baseURL] = useState("http://localhost:3000")
    const [editing, setEditing] = useState(false)
    const [notes, setNotes] = useState([])
    const [note, dispatch] = useReducer(reducer, {
        title: '',
        priority: '',
        done: false,
        id: null
    })

    const getNotes = (
        url = "",
        options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }) => {

        fetch(url, options) // pendient
            .then((response) => {
                console.log(response)
                if (!response.ok) throw Error("Ha ocurrido un error")
                return response.json()
            })
            .then((responseJson) => {
                console.log(responseJson)
                setNotes(responseJson)
            })
            .catch((error) => {
                console.log(error.message)
            })

    }

    const addNote = (url, options) => {
        fetch(url, options)
            .then((response) => {
                console.log(response)
                if (!response.ok) throw Error("Ha ocurrido un error al crear una nueva nota")
                return response.json()
            })
            .then((responseJson) => {
                console.log(responseJson)

                setNotes((notes) => (notes.concat(responseJson)))

            })
            .catch((error) => {
                console.log(error.message)
            })
    }

    const editNote = (url, options) => {
        fetch(url, options)
            .then((response) => {
                console.log(response)
                if (!response.ok) throw Error("Ha ocurrido un error al crear una nueva nota")
                return response.json()
            })
            .then((responseJson) => {
                //console.log(responseJson)

                setNotes((notes) => {
                    return notes.filter((note) => note.id !== responseJson.id).concat(responseJson).sort((a, b) => a.id - b.id)
                })

            })
            .catch((error) => {
                console.log(error.message)
            })
    }

    const deleteNote = (url, options) => {
        fetch(url, options)
            .then((response) => {
                console.log(response)
                if (!response.ok) throw Error("Ha ocurrido un error al crear una nueva nota")
                return response.json()
            })
            .then((responseJson) => {
                console.log(responseJson)

                const { id } = responseJson
                setNotes((notes) => (notes.filter((note) => note.id !== id)))

            })
            .catch((error) => {
                console.log(error.message)
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        //console.log(note)
        const raw = JSON.stringify(note)
        //console.log(raw)

        if (editing) {
            const url = `${baseURL}/notes/${note.id}`
            const options = {
                method: 'PUT',
                body: raw,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            editNote(url, options)
            setEditing(false)
        } else {
            const url = `${baseURL}/notes`
            const options = {
                method: 'POST',
                body: raw,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            addNote(url, options)
        }
        dispatch({ type: 'title', value: '' })
        dispatch({ type: 'priority', value: '' })
        dispatch({ type: 'done', value: false })
        dispatch({ type: 'id', value: null })
    }

    const handleDelete = (id) => {
        const url = `${baseURL}/notes/${id}`
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        deleteNote(url, options)
    }

    const setEditNote = note => {
        dispatch({ type: 'title', value: note.title })
        dispatch({ type: 'priority', value: note.priority })
        dispatch({ type: 'done', value: note.done })
        dispatch({ type: 'id', value: note.id })
        setEditing(true)
    }

    useEffect(() => {
        getNotes(`${baseURL}/notes`)
    }, [])

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="text-center">
                            My Notes
                        </h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                            Add new note
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <ul className="list-group">
                            {
                                notes.length > 0 ?
                                    notes.map((note) => {
                                        return (
                                            <li className='list-group-item d-flex justify-content-between' key={note.id}>
                                                <div>
                                                    <span>{note.title}</span>
                                                    <span className={`badge ${note.priority === 'low' ? 'bg-dark-subtle' : note.priority === 'medium' ? 'bg-warning' : 'bg-danger'}`}>{note.priority}</span>
                                                </div>
                                                <div>
                                                    <span><FaPencil onClick={() => {
                                                        setEditNote(note)
                                                    }} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" /></span>&nbsp;
                                                    <span><FaTrash onClick={() => handleDelete(note.id)} /></span>
                                                </div>
                                            </li>
                                        )
                                    })
                                    : (
                                        <li className='list-group-item'>Empty</li>
                                    )
                            }
                        </ul>
                    </div>
                </div>
            </div>


            <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="offcanvasExampleLabel">Notes</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div>
                        Please fill the form to create a new note
                    </div>
                    <div className="mt-3">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <label htmlFor="title" className="form-label">Title</label>
                                <input type="text" name="title" id="title" className="form-control" placeholder='Insert title'
                                    value={note.title}
                                    onChange={(e) => dispatch({ type: 'title', value: e.target.value })}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="priority" className="form-label">Priority</label>
                                <select name="priority" id="priority" className="form-select" value={note.priority} onChange={(e) => dispatch({ type: 'priority', value: e.target.value })}>
                                    <option value="">SELECT</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="form-group mb-3">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" role="switch" id="done" checked={note.done} onChange={(e) => dispatch({ type: 'done', value: !note.done })} />
                                    <label className="form-check-label" htmlFor="done">Done</label>
                                </div>
                            </div>
                            <button className="btn btn-primary w-100">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App