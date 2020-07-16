import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'

import { LeafletMouseEvent } from 'leaflet'

import axios from 'axios'
import api from '../../services/api'

import logo from '../../assets/logo.svg'

import Dropzone from '../../components/Dropzone'

import './styles.css'

interface Item {
  id: number
  image_url: string
  title: string
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const CreatePoint: React.FC = () => {
  const popup = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()

  const [InitialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ])

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ])

  const [inputName, setInputName] = useState('')
  const [inputEmail, setInputEmail] = useState('')
  const [inputWhatsapp, setInputWhatsapp] = useState('')

  const history = useHistory()

  const [formData, setFormData] = useState({
    name: inputName,
    email: inputEmail,
    whatsapp: inputWhatsapp,
  })

  useEffect(() => {
    api.get('/items').then(({ data: res }) => {
      setItems(res.data)
    })
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setInitialPosition([coords.latitude, coords.longitude])
    })
  }, [])

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then(res => {
        setUfs(res.data.map(item => item.sigla))
      })
  }, [])

  useEffect(() => {
    setFormData({
      name: inputName,
      email: inputEmail,
      whatsapp: inputWhatsapp,
    })
  }, [inputName, inputEmail, inputWhatsapp])
  useEffect(() => {
    if (selectedUf === '0') return
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then(res => {
        setCities(res.data.map(item => item.nome))
      })
  }, [selectedUf])

  function handleSelectedUf(e: ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value
    setSelectedUf(uf)
  }

  function handleInputNameChange(e: ChangeEvent<HTMLInputElement>) {
    setInputName(e.target.value)
  }
  function handleInputEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setInputEmail(e.target.value)
  }
  function handleInputWhatsappChange(e: ChangeEvent<HTMLInputElement>) {
    setInputWhatsapp(e.target.value)
  }

  function handleSelectedCity(e: ChangeEvent<HTMLSelectElement>) {
    const city = e.target.value
    setSelectedCity(city)
  }

  function handleMapClick(e: LeafletMouseEvent) {
    setSelectedPosition([e.latlng.lat, e.latlng.lng])
  }

  function handleSelectedItem(id: number) {
    const alredySelected = selectedItems.findIndex(item => item === id)

    if (alredySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)

      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const cidade = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData()

    
      data.append('name', name)
      data.append('email', email)
      data.append('whatsapp', whatsapp)
      data.append('latitude', String(latitude))
      data.append('longitude', String(longitude))
      data.append('cidade', cidade)
      data.append('uf', uf)
      data.append('items', items.join(','))

      if (selectedFile) {
        data.append('image', selectedFile)
      }
    

    await api.post('/points', data)

    alert('O Ponto de Coleta foi criado com sucesso')
    popup.current?.classList.remove('none')
    setTimeout(() => {
      history.push('/')
    }, 2000)
  }

  return (
    <>
      <div id='page-create-point'>
        <header>
          <img src={logo} alt='Ecoleta' />
          <Link to='/'>
            <FiArrowLeft />
            Voltar para Home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br /> ponto de coleta
          </h1>
          <Dropzone onFileUploaded={setSelectedFile}/>
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className='field'>
              <label htmlFor='name'>Nome da entidade</label>
              <input
                type='text'
                name='name'
                id='name'
                onChange={handleInputNameChange}
              />
            </div>
            <div className='field-group'>
              <div className='field'>
                <label htmlFor='e-mail'>E-mail</label>
                <input
                  type='email'
                  name='email'
                  id='email'
                  onChange={handleInputEmailChange}
                />
              </div>
              <div className='field'>
                <label htmlFor='whatsapp'>Whatsapp</label>
                <input
                  type='text'
                  name='whatsapp'
                  id='whatsapp'
                  onChange={handleInputWhatsappChange}
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </legend>
            <Map center={InitialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a horg/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              <Marker position={selectedPosition} />
            </Map>
            <div className='field-group'>
              <div className='field'>
                <label htmlFor='uf'>Estado (UF)</label>
                <select
                  value={selectedUf}
                  onChange={handleSelectedUf}
                  name='uf'
                  id='uf'
                >
                  <option value='0'>Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
              <div className='field'>
                <label htmlFor='city'>Cidade</label>
                <select
                  name='city'
                  id='city'
                  value={selectedCity}
                  onChange={handleSelectedCity}
                >
                  <option value='0'>Selecione uma Cidade</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Ítems de coleta</h2>
              <span>Selecione um ou mais ítems abaixo</span>
            </legend>
            <ul className='items-grid'>
              {items.map(item => (
                <li
                  key={item.id}
                  onClick={() => handleSelectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt='Oleo' />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>

            <button type='submit'>Cadastrar ponto de coleta</button>
          </fieldset>
        </form>
      </div>
      <div className='popup none' ref={popup}>
        <h1>
          <FiCheckCircle
            style={{
              color: '#34CB79',
              width: 50,
              height: 50,
              margin: '0 auto',
            }}
          />
          <strong>Cadastro concluído</strong>
        </h1>
      </div>
    </>
  )
}

export default CreatePoint
