import React from 'react';

export default function FormData({ details }) {
    const formatSpecialFeatures = (features) => {
        if (!features) return '';

        if (Array.isArray(features)) {
            return features.join(', ');
        }

        if (typeof features === 'object') {
            const selectedFeatures = Object.entries(features)
                .filter(([_, selected]) => selected)
                .map(([feature]) => feature);
            return selectedFeatures.join(', ');
        }

        return features;
    };

    return (
        <div>
            {details?.vehicle_type !== undefined ? (<p>Type de véhicule: {details?.vehicle_type}</p>) : null}
            {details?.brand !== undefined ? (<p>Marque: {details?.brand}</p>) : null}
            {details?.model !== undefined ? (<p>Modèle: {details?.model}</p>) : null}
            {details?.year !== undefined ? (<p>Année: {details?.year}</p>) : null}
            {details?.mileage !== undefined ? (<p>Kilométrage: {details?.mileage}</p>) : null}
            {details?.fuel_type !== undefined ? (<p>Type de carburant: {details?.fuel_type}</p>) : null}
            {details?.gearbox !== undefined ? (<p>Transmission: {details?.gearbox}</p>) : null}
            {details?.doors !== undefined ? (<p>Nombre de portes: {details?.doors}</p>) : null}
            {details?.seats !== undefined ? (<p>Nombre de sièges: {details?.seats}</p>) : null}
            {details?.color !== undefined ? (<p>Couleur: {details?.color}</p>) : null}
            {details?.condition !== undefined ? (<p>État: {details?.condition}</p>) : null}
            {details?.car_features !== undefined ? (<p>Équipements: {formatSpecialFeatures(details?.car_features)}</p>) : null}
            {details?.documents !== undefined ? (<p>Documents disponibles: {formatSpecialFeatures(details?.documents)}</p>) : null}
            {details?.vehicle_type !== undefined ? (<p>Type de véhicule: {details?.vehicle_type}</p>) : null}
            {details?.engine_capacity !== undefined ? (<p>Cylindrée (cc): {details?.engine_capacity}</p>) : null}
            {details?.seat_count !== undefined ? (<p>Nombre de places: {details?.seat_count}</p>) : null}
            {details?.rental_duration !== undefined ? (<p>Durée de location: {details?.rental_duration}</p>) : null}
            {details?.rental_conditions !== undefined ? (<p>Conditions de location: {details?.rental_conditions}</p>) : null}
            {details?.availability !== undefined ? (<p>Disponibilité: {details?.availability}</p>) : null}
            {details?.category !== undefined ? (<p>Catégorie: {details?.category}</p>) : null}
            {details?.compatibility !== undefined ? (<p>Compatibilité: {details?.compatibility}</p>) : null}
            {details?.exchange !== undefined ? (<p>Échange possible: {details?.exchange}</p>) : null}
            {details?.screen_size !== undefined ? (<p>Taille de l'écran (pouces): {details?.screen_size}</p>) : null}
            {details?.screen_type !== undefined ? (<p>Type d'écran: {details?.screen_type}</p>) : null}
            {details?.refresh_rate !== undefined ? (<p>Taux de rafraîchissement (Hz): {details?.refresh_rate}</p>) : null}
            {details?.screen_protection !== undefined ? (<p>Protection écran: {details?.screen_protection}</p>) : null}
            {details?.processor !== undefined ? (<p>Processeur: {details?.processor}</p>) : null}
            {details?.ram !== undefined ? (<p>RAM (Go): {details?.ram}</p>) : null}
            {details?.storage !== undefined ? (<p>Stockage interne (Go): {details?.storage}</p>) : null}
            {details?.expandable_storage !== undefined ? (<p>Stockage extensible: {details?.expandable_storage}</p>) : null}
            {details?.battery !== undefined ? (<p>Capacité de la batterie (mAh) : {details?.battery}</p>) : null}
            {details?.fast_charging !== undefined ? (<p>Charge rapide (W) : {details?.fast_charging}</p>) : null}
            {details?.wireless_charging !== undefined ? (<p>Charge sans fil : {details?.wireless_charging}</p>) : null}
            {details?.main_camera !== undefined ? (<p>Caméra principale (MP) : {details?.main_camera}</p>) : null}
            {details?.num_cameras !== undefined ? (<p>Nombre de capteurs  : {details?.num_cameras}</p>) : null}
            {details?.front_camera !== undefined ? (<p>Caméra frontale (MP)  : {details?.front_camera}</p>) : null}
            {details?.connectivity !== undefined ? (<p>Connectivité  : {formatSpecialFeatures(details?.connectivity)}</p>) : null}
            {details?.fingerprint !== undefined ? (<p>Capteur d'empreintes  : {details?.fingerprint}</p>) : null}
            {details?.face_recognition !== undefined ? (<p>Reconnaissance faciale  : {details?.face_recognition}</p>) : null}
            {details?.water_resistant !== undefined ? (<p>Résistance à l’eau  : {details?.water_resistant}</p>) : null}
            {details?.materials !== undefined ? (<p>Matériaux du châssis  : {details?.materials}</p>) : null}
            {details?.accessories !== undefined ? (<p>Accessoires inclus  : {formatSpecialFeatures(details?.accessories)}</p>) : null}
            {details?.gpu !== undefined ? (<p>Carte graphique  : {details?.gpu}</p>) : null}
            {details?.operating_system !== undefined ? (<p>Système d'exploitation  : {details?.operating_system}</p>) : null}
            {details?.power_supply !== undefined ? (<p>Alimentation (W)  : {details?.power_supply}</p>) : null}
            {details?.ports !== undefined ? (<p>Ports disponibles  : {formatSpecialFeatures(details?.ports)}</p>) : null}
            {details?.form_factor !== undefined ? (<p>Format du PC  : {details?.form_factor}</p>) : null}
            {details?.cooling_system !== undefined ? (<p>Système de refroidissement  : {details?.cooling_system}</p>) : null}
            {details?.keyboard_mouse !== undefined ? (<p>Clavier & Souris inclus  : {details?.keyboard_mouse}</p>) : null}
            {details?.monitor !== undefined ? (<p>Écran inclus  : {details?.monitor}</p>) : null}
            {details?.resolution !== undefined ? (<p>Résolution de l'écran  : {details?.resolution}</p>) : null}
            {details?.battery_life !== undefined ? (<p>Autonomie de la batterie (en heures)  : {details?.battery_life}</p>) : null}
            {details?.touchscreen !== undefined ? (<p>Écran tactile  : {details?.touchscreen}</p>) : null}
            {details?.keyboard_backlit !== undefined ? (<p>Clavier rétroéclairé  : {details?.keyboard_backlit}</p>) : null}
            {details?.weight !== undefined ? (<p>Poids (kg)  : {details?.weight}</p>) : null}
            {details?.webcam !== undefined ? (<p>Webcam intégrée  : {details?.webcam}</p>) : null}
            {details?.features !== undefined ? (<p>Caractéristiques spéciales  : {formatSpecialFeatures(details?.features)}</p>) : null}
            {details?.power_output !== undefined ? (<p>Puissance de sortie (Watts)  : {details?.power_output}</p>) : null}
            {details?.frequency_response !== undefined ? (<p>Réponse en fréquence (Hz)  : {details?.frequency_response}</p>) : null}
            {details?.wireless_standard !== undefined ? (<p>Norme sans fil  : {details?.wireless_standard}</p>) : null}
            {details?.storage_capacity !== undefined ? (<p>Capacité de stockage  : {details?.storage_capacity}</p>) : null}
             {details?.game_title !== undefined ? (<p>Titre du jeu  : {details?.game_title}</p>) : null}
            {details?.platform !== undefined ? (<p>Plateforme  : {details?.platform}</p>) : null}
            {details?.edition !== undefined ? (<p>Édition du jeu  : {details?.edition}</p>) : null}
            {details?.online_subscription !== undefined ? (<p>Abonnement en ligne inclus  : {details?.online_subscription}</p>) : null}
            {details?.accessories_included !== undefined ? (<p>Accessoires inclus  : {formatSpecialFeatures(details?.accessories_included)}</p>) : null}
            {details?.material !== undefined ? (<p>Matériau  : {details?.material}</p>) : null}
            {details?.capacity !== undefined ? (<p>Capacité (mAh ou Go)  : {details?.capacity}</p>) : null}
            {details?.device_type !== undefined ? (<p>Type d'appareil  : {details?.device_type}</p>) : null}
            {details?.megapixels !== undefined ? (<p>Résolution (MP)  : {details?.megapixels}</p>) : null}
            {details?.sensor_size !== undefined ? (<p>Taille du capteur  : {details?.sensor_size}</p>) : null}
            {details?.lens_mount !== undefined ? (<p>Monture d’objectif  : {details?.lens_mount}</p>) : null}
            {details?.video_resolution !== undefined ? (<p>Résolution vidéo  : {details?.video_resolution}</p>) : null}
            {details?.type_vetement !== undefined ? (<p>Type de vêtement  : {details?.type_vetement}</p>) : null}
            {details?.matiere !== undefined ? (<p>Matière  : {details?.matiere}</p>) : null}
            {details?.saison !== undefined ? (<p>Saison  : {details?.saison}</p>) : null}
            {details?.style !== undefined ? (<p>Style  : {details?.style}</p>) : null}
            {details?.longueur_manches !== undefined ? (<p>Longueur des manches  : {details?.longueur_manches}</p>) : null}
            {details?.size !== undefined ? (<p>Taille  : {formatSpecialFeatures(details?.size)}</p>) : null}
            {details?.type_chaussure !== undefined ? (<p>Type de chaussure  : {details?.type_chaussure}</p>) : null}
            {details?.pointure !== undefined ? (<p>Pointure  : {formatSpecialFeatures(details?.pointure)}</p>) : null}
            {details?.hauteur_talon !== undefined ? (<p>Hauteur du talon  : {details?.hauteur_talon}</p>) : null}
            {details?.type_accessoire !== undefined ? (<p>Type d'accessoire  : {details?.type_accessoire}</p>) : null}
            {details?.genre !== undefined ? (<p>Genre  : {details?.genre}</p>) : null}
            {details?.type_produit !== undefined ? (<p>Type de produit  : {details?.type_produit}</p>) : null}
            {details?.volume !== undefined ? (<p>Volume / Contenance  : {details?.volume}</p>) : null}
            {details?.composition !== undefined ? (<p>Composition  : {details?.composition}</p>) : null}
            {details?.type_peau !== undefined ? (<p>Type de peau  : {details?.type_peau}</p>) : null}
            {details?.origine !== undefined ? (<p>Origine  : {details?.origine}</p>) : null}
            {details?.dimensions !== undefined ? (<p>Dimensions  : {details?.dimensions}</p>) : null}
            {details?.longueur !== undefined ? (<p>Longueur (si applicable)  : {details?.longueur}</p>) : null}
            {details?.texture !== undefined ? (<p>Texture des cheveux  : {details?.texture}</p>) : null}
            {details?.fixation !== undefined ? (<p>Type de fixation  : {details?.fixation}</p>) : null}
            {details?.type_sous_vetement !== undefined ? (<p>Type de sous-vêtement  : {details?.type_sous_vetement}</p>) : null}
            {details?.property_type !== undefined ? (<p>Type de propriété  : {details?.property_type}</p>) : null}
            {details?.transaction_type !== undefined ? (<p>Type de transaction  : {details?.transaction_type}</p>) : null}
            {details?.area !== undefined ? (<p>Superficie (m²)  : {details?.area}</p>) : null}
            {details?.bedrooms !== undefined ? (<p>Nombre de chambres  : {details?.bedrooms}</p>) : null}
            {details?.bathrooms !== undefined ? (<p>Nombre de salles de bain  : {details?.bathrooms}</p>) : null}
            {details?.furnished !== undefined ? (<p>Meublé  : {details?.furnished}</p>) : null}
            {details?.parking !== undefined ? (<p>Parking  : {details?.parking}</p>) : null}
            {details?.swimming_pool !== undefined ? (<p>Piscine  : {details?.swimming_pool}</p>) : null}
            {details?.garden !== undefined ? (<p>Jardin  : {details?.garden}</p>) : null}
            {details?.residence_type !== undefined ? (<p>Type de résidence  : {details?.residence_type}</p>) : null}
            {details?.floor !== undefined ? (<p>Étage  : {details?.floor}</p>) : null}
            {details?.elevator !== undefined ? (<p>Ascenseur  : {details?.elevator}</p>) : null}
            {details?.security !== undefined ? (<p>Sécurité 24/7  : {details?.security}</p>) : null}
            {details?.balcony !== undefined ? (<p>Balcon  : {details?.balcony}</p>) : null}
            {details?.gym !== undefined ? (<p>Salle de sport  : {details?.gym}</p>) : null}
            {details?.age_range !== undefined ? (<p>Tranche d'âge  : {details?.age_range}</p>) : null}
            {details?.type_instrument !== undefined ? (<p>Type d'instrument  : {details?.type_instrument}</p>) : null}
            {details?.event_name !== undefined ? (<p>Nom de l'événement  : {details?.event_name}</p>) : null}
            {details?.event_type !== undefined ? (<p>Type d'événement  : {details?.event_type}</p>) : null}
            {details?.date !== undefined ? (<p>Date de l'événement  : {details?.date}</p>) : null}
            {details?.time !== undefined ? (<p>Heure de l'événement  : {details?.time}</p>) : null}
            {details?.event_location !== undefined ? (<p>Lieu de l'événement  : {details?.event_location}</p>) : null}
            {details?.product_type !== undefined ? (<p>Type de produit  : {details?.product_type}</p>) : null}
            {details?.home_service !== undefined ? (<p>Service à domicile  : {details?.home_service}</p>) : null}
            {details?.unit_of_measure !== undefined ? (<p>Unité de mesure  : {details?.unit_of_measure}</p>) : null}
            {details?.quantity !== undefined ? (<p>Quantité  : {details?.quantity}</p>) : null}
            {details?.delievery !== undefined ? (<p>Méthode de livraison  : {details?.delievery}</p>) : null}
        </div>
    );
};
