/// weekly assignment 1

// install dependency
const url = "https://raw.githubusercontent.com/makarim22/koda-b6-weekly/refs/heads/main/menu.txt";
const readline = require('readline');
const moment = require('moment');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let menuWithStock = []; 

const fetchMenuWithStock = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const menuItems = await response.json();
        menuWithStock = menuItems.map(item => ({
            ...item,
            stock: Math.floor(Math.random() * 50) + 1 
        }));

        return menuWithStock;
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
};
function getItem(id) {
    const item = menuWithStock.find(item => item.id === id);
    if (item) {
        return item; 
    } else {
        console.log('Item not found');
        return null; 
    }
}
function calculateInvoice(cart, quantity) {
    let total = 0;
    const itemNames = [];

    for (const item of cart) {
        total += item.price; 
        itemNames.push(item.name);  
    }
    const totalPrice = total * quantity; 
    return { totalPrice, itemNames: itemNames.join(', ') };
}

function checkout(cart) {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const money = 100000; 

    console.log(`Total belanja anda sebesar: Rp${total.toFixed(2)}`);
    console.log(`Kembalian anda sebesar: Rp${(money - total).toFixed(2)}`);
    console.log(`Terima kasih telah berbelanja di Mie Gacoan!`);
}

function historyTransaction(riwayatPesanan) {
    console.log('Riwayat Pesanan:');
    riwayatPesanan.forEach(transaction => {
        console.log(`pesanan atas nama : ${transaction.name} , tanggal pesan:  ${transaction.day}. item: ${transaction.itemNames}` );
    });
}
async function main() {
    const cart = []; 
    const riwayatPesanan = [];

    console.log('Selamat datang di Mie Gacoan!');

    rl.question('Masukkan nama anda: ', async (name) => {
        console.log(`Halo ${name}, selamat datang di Mie Gacoan!`);

        const day = moment().format('MMMM Do YYYY, h:mm:ss a'); 
        console.log(`Hari ini adalah hari ${day}.`);

        await fetchMenuWithStock();

        if (menuWithStock.length === 0) {
            console.log('Failed to fetch menu. Exiting...');
            rl.close();
            return;
        }

        const menuFriendly = menuWithStock.map(item => `${item.id}. ${item.name} - Rp${item.price} (Stock: ${item.stock})`).join('\n');
        console.log(`Berikut ini adalah daftar menu hari ini:\n${menuFriendly}`);

        const addItems = async () => {
            rl.question('Masukkan ID makanan untuk menambahkan ke keranjang: ', async (input) => {
                const itemId = Number(input);
                if (isNaN(itemId) || itemId <= 0) {
                    console.log('Input tidak valid: harus berupa angka positif');
                    return addItems(); 
                }

                const item = getItem(itemId); 
                if (item) {
                    if (item.stock > 0) {
                        cart.push(item); 
                        item.stock -= 1; 
                        console.log(`Barang ${item.name} ditambahkan ke keranjang. Stock tersisa: ${item.stock}`);
                    } else {
                        console.log(`Maaf, ${item.name} sudah habis.`);
                    }
                } else {
                    console.log('Tidak ada barang ditambahkan ke keranjang.');
                }
                riwayatPesanan.push({name, day, itemNames: item.name});
                rl.question("Masukkan quantity: ", (quantity) => {
                    if (isNaN(quantity) || quantity <= 0) {
                        console.log('Input tidak valid: harus berupa angka positif');
                    } else {
                        const invoice = calculateInvoice(cart, quantity);
                        console.log(`Total pesanan untuk ${invoice.itemNames} adalah: Rp${invoice.totalPrice.toFixed(2)}`);
                    }
                    rl.question("Apakah Anda ingin menambahkan lebih banyak item? (ya/tidak): ", (continueAdding) => {
                        if (continueAdding.toLowerCase() === 'ya') {
                            return addItems(); 
                        } else {
                            checkout(cart); 
                            historyTransaction(riwayatPesanan);
                            rl.close(); 
                        }
                    });
                });
            });
        };

        addItems(); 
    });
}

// memulai program
main();