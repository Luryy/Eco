import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';

import logo from '../../assets/logo.svg';

import api from '../../services/api';

import Dropzone from '../../components/index';

interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface ResIBGEUFs {
    sigla: string;
}

interface ResIBGECitys {
    nome: string;
}

const CreatePoint = () => {

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:''
    });

    const [selectedFile, setSelectedFile] = useState<File>();

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    const [selectedCoord, setSelectedCoord] = useState<[number, number]>([0,0]);
    const [inicialCoord, setInicialCoord] = useState<[number, number]>([0,0]);

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            setInicialCoord([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(res => setItems(res.data))
    }, []);

    useEffect(() => {
        axios.get<ResIBGEUFs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInicials = res.data.map(uf => uf.sigla );

            setUfs(ufInicials);
        })
    }, []);

    useEffect(() => {
        axios.get<ResIBGECitys[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const cityInicials = res.data.map(city => city.nome );

            setCities(cityInicials);
        })
    }, [selectedUf]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    };

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    };

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedCoord([
            event.latlng.lat,
            event.latlng.lng
        ]);
    };

    function handleFormData(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;

        setFormData({...formData, [name]:value});
    }

    function handleSelectedItem(id: number){
        const alreadyIncludes = selectedItems.findIndex(item => item === id);

        if(alreadyIncludes >= 0){
            const filterdItems = selectedItems.filter(item => item!== id);

            setSelectedItems(filterdItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedCoord;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if(selectedFile){
            data.append('image', selectedFile);
        }
        

        await api.post('points', data);
        alert('Ponto cadartrado com sucesso');

        history.push('/');
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input type="text" name="name" id="name" onChange={handleFormData}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleFormData}/>
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleFormData}/>
                        </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={inicialCoord} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />

                        <Marker position={selectedCoord} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" onChange={handleSelectedUf} value={selectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option value={uf} key={uf}>{uf}</option>
                                ))}
                                
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectedCity} value={selectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city =>(
                                    <option value={city} key={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item  => 
                            <li key={item.id}
                            onClick={()=> handleSelectedItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''} 
                            >
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                        )}
                        
                    </ul>
                    
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>


        </div>
    )

};

export default CreatePoint;