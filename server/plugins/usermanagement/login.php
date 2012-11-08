<?php

/*
 * mapshup - Webmapping made easy
 * http://mapshup.info
 *
 * Copyright Jérôme Gasperi, 2011.12.08
 *
 * jerome[dot]gasperi[at]gmail[dot]com
 *
 * This software is a computer program whose purpose is a webmapping application
 * to display and manipulate geographical data.
 *
 * This software is governed by the CeCILL-B license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-B
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-B license and that you accept its terms.
 */

include_once '../../config.php';
include_once '../../functions/general.php';

/**
 * This script returns GeoJSON
 */
header("Pragma: no-cache");
header("Expires: 0");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Content-type: application/json; charset=utf-8");

/**
 * Database connection
 */
$dbh = getVerifiedConnection($_REQUEST, array($_POST['email'], $_POST['password']), false) or die('{"error":{"message":"Problem on database connection"}}');

/**
 * Prepare query
 */
$query = "SELECT userid, username, password, email FROM users WHERE email='" . pg_escape_string(strtolower($_POST['email'])) . "'";
$result = pg_query($dbh, $query) or die('{"error":{"message":"Error"}}');
$userid = -1;
$username = "";
$email = "";
$password = "";

while ($user = pg_fetch_row($result)) {
    $userid = $user[0];
    $username = $user[1];
    $password = $user[2];
    $email = $user[3];
}

/**
 * username does not exist
 */
if ($userid == -1) {
    die('{"error":{"message":"email does not exists"}}');
}

/*
 * Get last saved context
 */
$query = "SELECT context FROM contexts WHERE userid='" . $userid . "'";
$result = pg_query($dbh, $query);
$context = null;

if ($result) {
    while ($contexts = pg_fetch_row($result)) {
        $context = $contexts[0];
    }
}

pg_close($dbh);

/**
 * Check login/password validity
 * If "encrypted" is set to true,
 * then the password is not "md5ized"
 * since it's allready encrypted
 * (cookie check case)
 */
if ((strtolower($_POST['email']) == $email) && (isset($_POST['encrypted']) ? $_POST['password'] : md5($_POST['password']) == $password)) {
    echo json_encode(array(
        'userid' => $userid,
        'username' => $username,
        'email' => $email,
        'icon' => getGravatar($email),
        'password' => $password,
        'context' => json_decode($context))
    );
} else {
    die('{"error":{"message":"Invalid password"}}');
}
?>
