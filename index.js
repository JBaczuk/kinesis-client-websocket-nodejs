const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
var kcl = require('aws-kcl');

// const app = express();
// var users = [];

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//     wss.clients.forEach(function each(client) {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(data);
//         }
//     });
// };

// wss.on('connection', function connection(ws, req) {
//     const location = url.parse(req.url, true);
//     // You might use location.query.access_token to authenticate or share sessions
//     // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
//     // TODO: don't allow users with the same id
//     console.log("User " + req.headers.origin + " joined!");
//     users.push(req.headers.origin);
//     wss.broadcast("room: User " + req.headers.origin + " joined!");

//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);
//         wss.broadcast(message);
//     });

//     ws.on('close', function close(ws, req) {
//         console.log('Connection closed...');
//     });
// });

// server.listen(8080, function listening() {
//     console.log('Listening on %d', server.address().port);
// });

var fs = require('fs');
var path = require('path');
var util = require('util');
// var logger = require('./util/logger');

/**
 * A simple implementation for the record processor (consumer) that simply writes the data to a log file.
 *
 * Be careful not to use the 'stderr'/'stdout'/'console' as log destination since it is used to communicate with the
 * {https://github.com/awslabs/amazon-kinesis-client/blob/master/src/main/java/com/amazonaws/services/kinesis/multilang/package-info.java MultiLangDaemon}.
 */

function recordProcessor() {
  var log = logger().getLogger('recordProcessor');
  var shardId;

  return {

    initialize: function(initializeInput, completeCallback) {
      shardId = initializeInput.shardId;

      completeCallback();
    },

    processRecords: function(processRecordsInput, completeCallback) {
      if (!processRecordsInput || !processRecordsInput.records) {
        completeCallback();
        return;
      }
      var records = processRecordsInput.records;
      var record, data, sequenceNumber, partitionKey;
      for (var i = 0 ; i < records.length ; ++i) {
        record = records[i];
        data = new Buffer(record.data, 'base64').toString();
        sequenceNumber = record.sequenceNumber;
        partitionKey = record.partitionKey;
        // log.info(util.format('ShardID: %s, Record: %s, SeqenceNumber: %s, PartitionKey:%s', shardId, data, sequenceNumber, partitionKey));
        console.log(util.format('ShardID: %s, Record: %s, SeqenceNumber: %s, PartitionKey:%s', shardId, data, sequenceNumber, partitionKey));
    }
      if (!sequenceNumber) {
        completeCallback();
        return;
      }
      // If checkpointing, completeCallback should only be called once checkpoint is complete.
      processRecordsInput.checkpointer.checkpoint(sequenceNumber, function(err, sequenceNumber) {
        // log.info(util.format('Checkpoint successful. ShardID: %s, SeqenceNumber: %s', shardId, sequenceNumber));
        console.log(util.format('Checkpoint successful. ShardID: %s, SeqenceNumber: %s', shardId, sequenceNumber));
        completeCallback();
      });
    },

    shutdownRequested: function(shutdownRequestedInput, completeCallback) {
      shutdownRequestedInput.checkpointer.checkpoint(function (err) {
        completeCallback();
      });
    },

    shutdown: function(shutdownInput, completeCallback) {
      // Checkpoint should only be performed when shutdown reason is TERMINATE.
      if (shutdownInput.reason !== 'TERMINATE') {
        completeCallback();
        return;
      }
      // Whenever checkpointing, completeCallback should only be invoked once checkpoint is complete.
      shutdownInput.checkpointer.checkpoint(function(err) {
        completeCallback();
      });
    }
  };
}

kcl(recordProcessor()).run();
