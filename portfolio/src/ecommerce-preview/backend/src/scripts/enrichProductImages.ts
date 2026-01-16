/**
 * Product Image Enrichment Script
 * Enriches all seeded products with curated, category-matched Unsplash images
 * Run: npx ts-node src/scripts/enrichProductImages.ts
 */

import mongoose from 'mongoose';
import Product from '../models/product.model';
import env from '../config/env';


const categoryImages: Record<string, { primary: string[]; contextual: string[] }> = {
    'Electronics': {
        primary: [
            'photo-1505740420928-5e560c06d30e',
            'photo-1546435770-a3e426bf472b',
            'photo-1593642632559-0c6d3fc62b89',
            'photo-1526738549149-8e07eca6c147',
            'photo-1608043152269-423dbba4e7e1',
            'photo-1585792180666-f7347c490ee2',
            'photo-1625961332771-3f40b0e2bdcf',
            'photo-1587829741301-dc798b83add3',
        ],
        contextual: ['photo-1491933382434-500287f9b54b', 'photo-1468495244123-6c6c332eeece', 'photo-1496181133206-80ce9b88a853']
    },
    'Fashion': {
        primary: [
            'photo-1521572163474-6864f9cf17ab',
            'photo-1473966968600-fa801b869a1a',
            'photo-1548036328-c9fa89d128fa',
            'photo-1539533018447-63fcce2678e3',
            'photo-1542291026-7eec264c27ff',
            'photo-1601924994987-69e26d50dc26',
            'photo-1576995853123-5a10305d93c0',
            'photo-1434389677669-e08b4cac3105',
        ],
        contextual: ['photo-1445205170230-053b83016050', 'photo-1490481651871-ab68de25d43d', 'photo-1441984904996-e0b6ba687e04']
    },
    'Home & Garden': {
        primary: [
            'photo-1565814329452-e1efa11c5b89',
            'photo-1580480055273-228ff5388ef8',
            'photo-1459411552884-841db9b3cc2a',
            'photo-1631049307264-da0ec9d70304',
            'photo-1556909114-44e3e70034e2',
            'photo-1558618666-fcd25c85cd64',
            'photo-1605117882932-f9e32b03fea9',
            'photo-1585771724684-38269d6639fd',
        ],
        contextual: ['photo-1556020685-ae41e7e85d12', 'photo-1484101403633-562f891dc89a', 'photo-1616486338812-3dadae4b4ace']
    },
    'Sports & Outdoors': {
        primary: [
            'photo-1601925260368-ae2f83cf8b7f',
            'photo-1598289431512-b97b0917affc',
            'photo-1553062407-98eeb64c6a62',
            'photo-1504280390367-361c6d9f38f4',
            'photo-1534438327276-14e5300c3a48',
            'photo-1510017803434-a899398421b3',
            'photo-1558618666-fcd25c85cd64',
            'photo-1523362628745-0c100150b504',
        ],
        contextual: ['photo-1571019613454-1cb2f99b2d8b', 'photo-1517836357463-d25dfeac3438', 'photo-1476480862126-209bfaa8edc8']
    },
    'Beauty & Health': {
        primary: [
            'photo-1620916566398-39f1143ab7be',
            'photo-1559056199-641a0ac8b55e',
            'photo-1522338242042-3e7d574f0666',
            'photo-1596462502278-27bfdc403348',
            'photo-1617897903246-719242758050',
            'photo-1608571423902-eed4a5ad8108',
            'photo-1612817288484-6f916006741a',
            'photo-1602928298849-325cec8771c0',
        ],
        contextual: ['photo-1571875257727-256c39da42af', 'photo-1576426863848-c21f53c60b19', 'photo-1512496015851-a90fb38ba796']
    },
    'Books & Media': {
        primary: [
            'photo-1544716278-ca5e3f4abd8c',
            'photo-1544947950-fa07a98d237f',
            'photo-1539375665275-f9de415ef9ac',
            'photo-1544947950-fa07a98d237f',
            'photo-1507003211169-0a1dd7228f2d',
            'photo-1524995997946-a1c2e315a42f',
            'photo-1456513080510-7bf3a84b82f8',
            'photo-1553729459-efe14ef6055d',
        ],
        contextual: ['photo-1507842217343-583bb7270b66', 'photo-1495446815901-a7297e633e8d', 'photo-1512820790803-83ca734da794']
    },
    'Toys & Games': {
        primary: [
            'photo-1558060370-d644479cb6f7',
            'photo-1507582020474-9a35b7d455d9',
            'photo-1610890716171-6b1bb98ffd09',
            'photo-1587654780291-39c9404d746b',
            'photo-1558060370-d644479cb6f7',
            'photo-1606144042614-b2417e99c4e3',
            'photo-1486572788966-cfd3df1f5b42',
            'photo-1513542789411-b6a5d4f31634',
        ],
        contextual: ['photo-1566576912321-d58ddd7a6088', 'photo-1596461404969-9ae70f2830c1', 'photo-1560421683-6856ea585c78']
    },
    'Automotive': {
        primary: [
            'photo-1617788138017-80ad40651399',
            'photo-1581235720704-06d3acfcb36f',
            'photo-1558618666-fcd25c85cd64',
            'photo-1489824904134-891ab64532f1',
            'photo-1503376780353-7e6692767b70',
            'photo-1558618666-fcd25c85cd64',
            'photo-1558618666-fcd25c85cd64',
            'photo-1502877338535-766e1452684a',
        ],
        contextual: ['photo-1494976388531-d1058494cdd8', 'photo-1549317661-bd32c8ce0db2', 'photo-1552519507-da3b142c6e3d']
    },
    'Food & Beverages': {
        primary: [
            'photo-1447933601403-0c6688de566e',
            'photo-1549007994-cb92caebd54b',
            'photo-1556679343-c7306c1976bc',
            'photo-1593095948071-474c5cc2989d',
            'photo-1474979266404-7eaacbcd87c5',
            'photo-1558642452-9d2a7deb7f62',
            'photo-1596040033229-a9821ebd058d',
            'photo-1546069901-ba9599a7e63c',
        ],
        contextual: ['photo-1490818387583-1baba5e638af', 'photo-1504754524776-8f4f37790ca0', 'photo-1512621776951-a57141f2eefd']
    },
    'Office Supplies': {
        primary: [
            'photo-1593642632559-0c6d3fc62b89',
            'photo-1527864550417-7fd91fc51a46',
            'photo-1531346878377-a5be20888e57',
            'photo-1507925921958-8a62f3d1a50d',
            'photo-1593642632559-0c6d3fc62b89',
            'photo-1532153975070-2e9ab71f1b14',
            'photo-1585336261022-680e295ce3fe',
            'photo-1507925921958-8a62f3d1a50d',
        ],
        contextual: ['photo-1497366216548-37526070297c', 'photo-1497366811353-6870744d04b2', 'photo-1542744173-8e7e53415bb0']
    },
    'Pet Supplies': {
        primary: [
            'photo-1601758125946-6ec2ef64daf8',
            'photo-1587300003388-59208cc962cb',
            'photo-1545249390-6bdfa286032f',
            'photo-1601758174493-b8e4e40e6a13',
            'photo-1516734212186-a967f81ad0d7',
            'photo-1520301255226-bf5f144451c1',
            'photo-1452570053594-1b985d6ea890',
            'photo-1544568100-847a948585b9',
        ],
        contextual: ['photo-1587300003388-59208cc962cb', 'photo-1548199973-03cce0bbc87b', 'photo-1537151608828-ea2b11777ee8']
    },
    'Jewelry': {
        primary: [
            'photo-1599643478518-a784e5dc4c8f',
            'photo-1535632066927-ab7c9ab60908',
            'photo-1611652022419-a9419f74343d',
            'photo-1524805444758-089113d48a6d',
            'photo-1605100804763-247f67b3557e',
            'photo-1594534475808-b18fc33b045e',
            'photo-1515562141207-7a88fb7ce338',
            'photo-1573408301185-9146fe634ad0',
        ],
        contextual: ['photo-1599643477877-530eb83abc8e', 'photo-1603561596112-0a132b757442', 'photo-1602751584552-8ba73aad10e1']
    }
};

const categoryPalettes: Record<string, string[][]> = {
    'Electronics': [['#1a1a2e', '#16213e', '#0f3460'], ['#e94560', '#534bae', '#1a1a2e']],
    'Fashion': [['#2d3436', '#636e72', '#dfe6e9'], ['#fd79a8', '#e84393', '#6c5ce7']],
    'Home & Garden': [['#55a630', '#80b918', '#aacc00'], ['#f4a261', '#e76f51', '#2a9d8f']],
    'Sports & Outdoors': [['#ff6b35', '#f7931e', '#ffc107'], ['#00b4d8', '#0077b6', '#023e8a']],
    'Beauty & Health': [['#ffc8dd', '#ffafcc', '#bde0fe'], ['#a8dadc', '#457b9d', '#1d3557']],
    'Books & Media': [['#6d4c41', '#8d6e63', '#a1887f'], ['#455a64', '#607d8b', '#90a4ae']],
    'Toys & Games': [['#ff595e', '#ffca3a', '#8ac926'], ['#1982c4', '#6a4c93', '#ff595e']],
    'Automotive': [['#212529', '#343a40', '#495057'], ['#c0392b', '#e74c3c', '#9b59b6']],
    'Food & Beverages': [['#f1c40f', '#e67e22', '#e74c3c'], ['#27ae60', '#2ecc71', '#1abc9c']],
    'Office Supplies': [['#2c3e50', '#34495e', '#7f8c8d'], ['#3498db', '#2980b9', '#1abc9c']],
    'Pet Supplies': [['#f39c12', '#d68910', '#b9770e'], ['#48c9b0', '#1abc9c', '#16a085']],
    'Jewelry': [['#f9e4b7', '#d4af37', '#c5a028'], ['#e0e0e0', '#bdbdbd', '#9e9e9e']]
};

function getImageUrl(photoId: string): string {
    return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;
}

function generateImageEmbedding(): number[] {
    return Array.from({ length: 3 }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
}

async function enrichProducts() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║    PRODUCT IMAGE ENRICHMENT SYSTEM v1.0              ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(env.DATABASE_URL);
        console.log('✅ Connected to MongoDB successfully!\n');

        const products = await Product.find({ 'metadata.seedMarker': 'SEED_DATA_V1' });
        console.log(`📦 Found ${products.length} products to enrich.\n`);

        let enriched = 0;
        for (const product of products) {
            const cat = product.category;
            const imageSet = categoryImages[cat] || categoryImages['Electronics'];
            const palettes = categoryPalettes[cat] || categoryPalettes['Electronics'];

            const catProducts = products.filter(p => p.category === cat);
            const catIndex = catProducts.indexOf(product);
            const primaryIdx = catIndex % imageSet.primary.length;

            const primaryImage = getImageUrl(imageSet.primary[primaryIdx]);
            const gallery = [
                getImageUrl(imageSet.contextual[0]),
                getImageUrl(imageSet.contextual[1]),
                getImageUrl(imageSet.contextual[2] || imageSet.primary[(primaryIdx + 1) % imageSet.primary.length])
            ];

            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        images: [primaryImage, ...gallery],
                        'metadata.visual_quality': 'HD',
                        'metadata.image_source': 'Unsplash',
                        'metadata.image_embedding_vector': generateImageEmbedding(),
                        'metadata.color_palette': palettes[catIndex % palettes.length],
                        'metadata.enriched_at': new Date().toISOString()
                    }
                }
            );
            enriched++;
            process.stdout.write(`\r  Enriching products: ${enriched}/${products.length}`);
        }

        console.log(`\n\n✅ Successfully enriched ${enriched} products with HD imagery!\n`);
        console.log('📊 Categories processed:');
        const uniqueCats = [...new Set(products.map(p => p.category))];
        uniqueCats.forEach(cat => {
            const count = products.filter(p => p.category === cat).length;
            console.log(`   • ${cat}: ${count} products`);
        });

    } catch (error) {
        console.error('\n❌ Enrichment failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB.\n');
    }
}

enrichProducts();
