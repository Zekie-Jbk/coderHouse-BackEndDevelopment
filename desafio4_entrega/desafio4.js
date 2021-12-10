// Desafío 4:
//1) Realizar un proyecto de Servidor Basado en NodeJS que utilice el módulo express e implemente los siguientes endpoints en el puerto 8080.
//
// a) Ruta Get '/productos' que devuelva un Array con todos los productos disponibles en el Servidor.
// b) Ruta Get '/productoRandom' que devuelva un producto al azar entre todos los productos disponibles. 
//
//2) Incluir un archivo de texto 'productos.txt' y utilizar la clase Contenedor del desafío anterior para acceder a los datos persistidos del servidor. 


const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const fs = require('fs');
const express = require('express');


//Defino la clase Contenedor.

class Contenedor{
    constructor(fileName){
        this.fileName = fileName;
    };

    totalObjectsInFile(){
        //Un método para obtener la cantidad de Objetos en el Archivo. Se utiliza para definir el nuevo número de ID.
        const productsInFileArray = this.fileToObject();
        let countOfProducts = 0;
        productsInFileArray.forEach(function(element){
            countOfProducts ++;
        })
        return countOfProducts;
    };
    
    //Un método para devolver un Array de Objetos en base a los contenidos del archivo.
    //Es el método getAll requerido por la consigna también.
    fileToObject(){
   
        const fileString = fs.readFileSync(this.fileName).toString();
        const fileObj = JSON.parse(fileString);

        return fileObj;
    };

    //Un método para verificar si el producto que se quiere agregar ya se encuentra en el archivo.
    //Intenté realizar una validación del producto. Pero sin importar el resultado, recibo 'False'. Habrá algún error en la lógica?
   
    productExists(productName){
        const productsInFileArray = this.fileToObject();
        productsInFileArray.forEach(function(element){
            if(element.nombre === productName){
                //console.log(`elemento ${element.nombre} - producto: ${productName}`);
                return true;
            }
        });
        return false;

    };

    

    save(Object){
        //Verifico si el archivo es nuevo (tiene contenido Null). De ser así hago la escritura del primer objeto.

        if(!fs.existsSync(this.fileName)){
            Object.id = 1;
            let newProduct = [];
            newProduct[0] = Object;
            fs.writeFileSync(this.fileName, JSON.stringify(newProduct, null, 2));
        }
      
        //Si no es un archivo nuevo, y no tiene contenido Null (ya tiene minimamente un objeto, construyo el array de objetos actuales.)
        else{
            console.log(Object.nombre);
            //Verifico si el producto ya está en el archivo, de ser así no procedo a la carga de un duplicado.
            //No funciona correctamente.
            if(this.productExists(Object.nombre)){
                console.log(`El producto ${Object.name} ya existe. No se realizó la carga del producto.`);
            }
            else{
                const productsInFileArray = this.fileToObject();
                const newId = this.totalObjectsInFile() + 1;
                Object.id = newId;
                productsInFileArray.push(Object);
                fs.writeFileSync(this.fileName, JSON.stringify(productsInFileArray, null, 2));
            }
        }

    
    };

    //Método getAll();
    getAll(){
        return this.fileToObject();

    };

    //Método getById
    getById(number){
        const productsInFileArray = this.fileToObject();
        let posCounter = 0;

        productsInFileArray.forEach(function(element){
            if(element.id != number){
                posCounter++;
            }
            else{
                return productsInFileArray[posCounter];
            }
        });
        console.log(`No se encontró un producto con ID:${number}`);
    };

    //Método deleteById()
    deleteById(number){
        //Primero identifico todas las posiciones donde se encuentre el producto con el ID que se busca.
        const productsInFileArray = this.fileToObject();
        let posCounter = 0;
        let posToDelete = [];
        productsInFileArray.forEach(function(element){
            if(element.id != number){
                posCounter ++;
            }
            else{
                posToDelete.push(posCounter);
            }
        });

        //Identificados todas las posiciones donde se encuentra el ID que deseo eliminar, los elimino.
        
        if(posToDelete.length === 0){
            console.log(`No se encontraron productos con ID ${number}`);
        }
        else{
            for(let i = 0; i < posToDelete.length; i++){
                productsInFileArray.splice(i, 1);
            }
            fs.writeFileSync(this.fileName, JSON.stringify(productsInFileArray, null, 2));
        };

    };

    deleteAll(){
        fs.unlink(this.fileName, (err) => {
            if(err){
                console.log("Error en el borrado del archivo");
            }
            else{
                console.log("Archivo eliminado correctamente");
            }
        });
    };

    //Agrego la funcion Random para obtener un valor aleatorio entre un minimo y un maximo.
    randomBetween(min, max){
        return Math.floor(
            Math.random() * (max - min) + min
        );
    };

    //Agrego la funcion para obtener un producto aleatorio del contenedor.
    getRandomProduct(){
        const productsInFileArray = this.fileToObject();
        const randomPos = this.randomBetween(productsInFileArray.length, 0);
        return(productsInFileArray[randomPos]);

    };

};




//Prueba de metodos
archivo = "./productos.txt";


const app = express();
const PORT =   process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor Activo y escuchando en el puerto ${PORT}`);
});

let contenedor = new Contenedor(archivo);


app.get('/productos', (req, res)=> {
    const productos = contenedor.getAll();
    res.send(productos);
});


app.get('/productoRandom', (req, res)=> {
    const productoRandom = contenedor.getRandomProduct();
    res.send(productoRandom);
});
